import { Role } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import prisma from '../../../db/db.config';
import { builderQuery } from '../../builders/prismaBuilderQuery';
import AppError from '../../errors/AppError';
import {
  FEATURE_DEFINITIONS,
  PermissionAction,
  SUPPORTED_ACTIONS,
  buildPermissionsMap,
  canonicalFeatureKey,
  isKnownFeature,
  permissionsMapFromLegacyFeatures,
} from '../../constant/permissions';

export interface PermissionInput {
  feature: string;
  action: string;
}

interface IRolePayload {
  name: string;
  status?: Role['status'];
  /** Granular permissions (canonical feature keys). */
  permissions?: PermissionInput[];
  /** Legacy input: each feature grants all of its supported actions. */
  roleFeature?: { name: string; path: string; index: number }[];
}

const isSuperAdminRole = (name?: string) =>
  (name ?? '').toLowerCase() === 'super admin';

/** Every (feature, action) pair the system supports. */
const fullPermissionSet = (): PermissionInput[] =>
  FEATURE_DEFINITIONS.flatMap((f) =>
    f.actions.map((action) => ({ feature: f.key, action })),
  );

const hasFullPermissions = (permissions: PermissionInput[]): boolean => {
  const set = new Set(permissions.map((p) => `${p.feature}:${p.action}`));
  return fullPermissionSet().every((p) => set.has(`${p.feature}:${p.action}`));
};

/** Normalize DTO input (granular or legacy) to a deduped permission list. */
const normalizePermissions = (
  payload: Pick<IRolePayload, 'permissions' | 'roleFeature'>,
): PermissionInput[] => {
  if (payload.permissions && payload.permissions.length >= 0) {
    const seen = new Set<string>();
    const out: PermissionInput[] = [];
    for (const p of payload.permissions) {
      const feature = canonicalFeatureKey(p.feature);
      const key = `${feature}:${p.action}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ feature, action: p.action });
      }
    }
    return out;
  }
  const out: PermissionInput[] = [];
  for (const f of payload.roleFeature ?? []) {
    const feature = canonicalFeatureKey(f.path);
    if (!isKnownFeature(feature)) continue;
    for (const action of SUPPORTED_ACTIONS[feature]) {
      out.push({ feature, action });
    }
  }
  return out;
};

const createRoleIntoDB = async (payload: IRolePayload) => {
  const existingRoleWithName = await prisma.role.findFirst({
    where: {
      name: payload.name,
    },
  });

  if (existingRoleWithName) {
    throw new AppError(409, `Role with name ${payload.name} already exists`);
  }

  const permissions = normalizePermissions(payload);
  const features = [...new Set(permissions.map((p) => p.feature))];

  const role = await prisma.role.create({
    data: {
      name: payload.name,
      ...(payload.status ? { status: payload.status } : {}),
      roleFeature: {
        create: features.map((feature, order) => {
          const label =
            FEATURE_DEFINITIONS.find((f) => f.key === feature)?.label ??
            feature;
          return { name: label, path: feature, index: order + 1 };
        }),
      },
      rolePermission: {
        create: permissions.map((p) => ({
          feature: p.feature,
          action: p.action,
        })),
      },
    },
    include: {
      roleFeature: true,
      rolePermission: true,
    },
  });

  return role;
};

const getRolesFromDB = async (query: Record<string, any>) => {
  const rolesQuery = builderQuery({
    searchFields: ['name'],
    searchTerm: query.searchTerm,
    orderBy: query.orderBy ? JSON.parse(query.orderBy) : {},
    filter: query.filter ? JSON.parse(query.filter) : {},
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
  });

  const [roles, totalCount] = await prisma.$transaction([
    prisma.role.findMany({
      where: rolesQuery.where,
      include: {
        roleFeature: true,
        rolePermission: true,
        adminUser: true,
      },
    }),
    prisma.role.count({
      where: rolesQuery.where,
    }),
  ]);

  return {
    meta: {
      totalItems: totalCount,
      currentPage: Number(query.page) || 1,
      totalPages: Math.ceil(totalCount / rolesQuery.take),
    },
    data: roles,
  };
};

const getRoleByIdFromDB = async (id: string) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      roleFeature: true,
      rolePermission: true,
      adminUser: true,
    },
  });

  if (!role) {
    throw new AppError(404, `Role with ID ${id} not found`);
  }

  return role;
};

const updateRoleIntoDB = async (
  id: string,
  payload: Partial<IRolePayload>,
  requester?: JwtPayload,
) => {
  const existingRole = await prisma.role.findUnique({
    where: { id },
    include: { roleFeature: true, rolePermission: true },
  });

  if (!existingRole) {
    throw new AppError(404, `Role with ID ${id} not found`);
  }

  const targetIsSuperAdmin = isSuperAdminRole(existingRole.name);

  // Prevent renaming the Super Admin role (keeps guards / seed data consistent)
  if (
    targetIsSuperAdmin &&
    payload.name &&
    payload.name !== existingRole.name
  ) {
    throw new AppError(403, 'Super Admin role cannot be renamed');
  }

  if (payload.name) {
    const existingRoleWithName = await prisma.role.findFirst({
      where: {
        name: payload.name,
        id: {
          not: id,
        },
      },
    });
    if (existingRoleWithName) {
      throw new AppError(409, `Role with name ${payload.name} already exists`);
    }
  }

  const permissionsTouched =
    payload.permissions !== undefined || payload.roleFeature !== undefined;
  const nextPermissions = permissionsTouched
    ? normalizePermissions(payload)
    : null;

  // Super Admin cannot be edited into a weaker role: its permission set must
  // always cover every supported (feature, action) pair.
  if (targetIsSuperAdmin && nextPermissions && !hasFullPermissions(nextPermissions)) {
    throw new AppError(
      403,
      'Super Admin role must keep all permissions and cannot be weakened',
    );
  }

  // A user cannot remove their own Roles access: editing your own role must
  // keep view on roles_permissions.
  if (requester && nextPermissions) {
    const requesterAdmin = await prisma.adminUser.findUnique({
      where: { id: requester.id },
    });
    if (
      requesterAdmin &&
      requesterAdmin.roleId === id &&
      !nextPermissions.some(
        (p) =>
          p.feature === 'roles_permissions' &&
          (p.action as string) === 'view',
      )
    ) {
      throw new AppError(
        403,
        'You cannot remove Roles access from your own role',
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.status !== undefined) data.status = payload.status;

  // Replace features + permissions atomically so a failed write never leaves
  // the role with zero permissions.
  const updatedRole = await prisma.$transaction(async (tx) => {
    if (nextPermissions) {
      await tx.roleFeature.deleteMany({ where: { roleId: id } });
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      const features = [...new Set(nextPermissions.map((p) => p.feature))];
      if (features.length > 0) {
        await tx.roleFeature.createMany({
          data: features.map((feature, order) => {
            const label =
              FEATURE_DEFINITIONS.find((f) => f.key === feature)?.label ??
              feature;
            return { name: label, path: feature, index: order + 1, roleId: id };
          }),
        });
      }
      if (nextPermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: nextPermissions.map((p) => ({
            feature: p.feature,
            action: p.action,
            roleId: id,
          })),
        });
      }
    }

    return tx.role.update({
      where: { id },
      data,
      include: {
        roleFeature: true,
        rolePermission: true,
        adminUser: true,
      },
    });
  });

  return updatedRole;
};

const deleteRoleFromDB = async (id: string, requester?: JwtPayload) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      _count: { select: { adminUser: true } },
    },
  });

  if (!role) {
    throw new AppError(404, `Role with ID ${id} not found`);
  }

  if (isSuperAdminRole(role.name)) {
    throw new AppError(403, 'Super Admin role cannot be deleted');
  }

  // A user cannot delete their own role.
  if (requester) {
    const requesterAdmin = await prisma.adminUser.findUnique({
      where: { id: requester.id },
    });
    if (requesterAdmin && requesterAdmin.roleId === id) {
      throw new AppError(403, 'You cannot delete your own role');
    }
  }

  // Prevent deleting a role that still has admins assigned.
  if (role._count.adminUser > 0) {
    throw new AppError(
      409,
      `Cannot delete role "${role.name}" because ${role._count.adminUser} admin user(s) are still assigned to it. Reassign them first.`,
    );
  }

  const deletedRole = await prisma.role.delete({
    where: { id },
  });

  return deletedRole;
};

const updateAdminUserRole = async (
  adminUserId: string,
  newRoleId: string,
  requester?: JwtPayload,
) => {
  const adminUser = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
  });
  if (!adminUser) {
    throw new AppError(404, `Admin User with ID ${adminUserId} not found`);
  }
  const newRole = await prisma.role.findUnique({
    where: { id: newRoleId },
  });
  if (!newRole) {
    throw new AppError(404, `Role with ID ${newRoleId} not found`);
  }

  // Only a Super Admin can assign the Super Admin role.
  if (isSuperAdminRole(newRole.name)) {
    const requesterAdmin = requester
      ? await prisma.adminUser.findUnique({
          where: { id: requester.id },
          include: { role: true },
        })
      : null;
    if (!requesterAdmin || !isSuperAdminRole(requesterAdmin.role?.name)) {
      throw new AppError(
        403,
        'Only a Super Admin can assign the Super Admin role',
      );
    }
  }

  const updatedAdminUser = await prisma.adminUser.update({
    where: { id: adminUserId },
    data: { roleId: newRoleId },
  });
  const { password: _password, ...rest } = updatedAdminUser;
  void _password;
  return rest;
};

const deleteAdminUserFromDB = async (
  adminUserId: string,
  loggedUser?: JwtPayload,
) => {
  const adminUser = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
    include: { role: true },
  });
  if (!adminUser) {
    throw new AppError(404, `Admin User with ID ${adminUserId} not found`);
  }

  // Do not allow deleting yourself.
  if (loggedUser && adminUser.id === (loggedUser as JwtPayload).id) {
    throw new AppError(403, 'You cannot delete your own account');
  }

  // Do not allow deleting the last remaining Super Admin.
  if (adminUser.role?.name?.toLowerCase() === 'super admin') {
    const superAdminCount = await prisma.adminUser.count({
      where: { roleId: adminUser.roleId },
    });
    if (superAdminCount <= 1) {
      throw new AppError(
        403,
        'Cannot delete the last remaining Super Admin',
      );
    }
  }

  const deletedAdminUser = await prisma.adminUser.delete({
    where: { id: adminUserId },
  });
  const { password: _password, ...rest } = deletedAdminUser;
  void _password;
  return rest;
};

export const buildRolePermissionsMap = (
  rolePermission: { feature: string; action: string }[],
  roleFeature: { path: string }[],
) =>
  rolePermission.length > 0
    ? buildPermissionsMap(rolePermission)
    : permissionsMapFromLegacyFeatures(roleFeature);

export const RoleService = {
  createRoleIntoDB,
  getRolesFromDB,
  getRoleByIdFromDB,
  updateRoleIntoDB,
  deleteRoleFromDB,
  updateAdminUserRole,
  deleteAdminUserFromDB,
};

export type { PermissionAction };
export { SUPPORTED_ACTIONS };
