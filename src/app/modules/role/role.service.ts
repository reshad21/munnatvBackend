import { Role, RoleFeature } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import prisma from '../../../db/db.config';
import { builderQuery } from '../../builders/prismaBuilderQuery';
import AppError from '../../errors/AppError';

interface IRoleType extends Role {
  roleFeature: RoleFeature[];
}

const createRoleIntoDB = async (payload: IRoleType) => {
  const existingRoleWithName = await prisma.role.findFirst({
    where: {
      name: payload.name,
    },
  });

  if (existingRoleWithName) {
    throw new AppError(409, `Role with name ${payload.name} already exists`);
  }

  const role = await prisma.role.create({
    data: {
      ...payload,
      roleFeature: {
        create: payload.roleFeature.map((feature) => ({
          name: feature.name,
          path: feature.path,
          index: feature.index,
        })),
      },
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
        adminUser: true
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
      adminUser: true
    },
  });

  if (!role) {
    throw new AppError(404, `Role with ID ${id} not found`);
  }

  return role;
};

const updateRoleIntoDB = async (id: string, payload: Partial<IRoleType>) => {
  const existingRole = await prisma.role.findUnique({
    where: { id },
    include: { roleFeature: true },
  });

  if (!existingRole) {
    throw new AppError(404, `Role with ID ${id} not found`);
  }

  const isSuperAdmin =
    existingRole.name.toLowerCase() === 'super admin';

  // Prevent renaming the Super Admin role (keeps guards / seed data consistent)
  if (isSuperAdmin && payload.name && payload.name !== existingRole.name) {
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

  // Prevent stripping the core permission from Super Admin.
  // Accepts both the seeded path ('roles_permissions') and the legacy
  // client path ('roles') so edits saved from the dashboard aren't rejected.
  if (isSuperAdmin && payload.roleFeature) {
    const hasCorePermission = payload.roleFeature.some(
      (feature) =>
        feature.path === 'roles_permissions' || feature.name === 'Roles',
    );
    if (!hasCorePermission) {
      throw new AppError(
        403,
        'Super Admin role must keep the Roles & Permissions access',
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.status !== undefined) data.status = payload.status;

  // Replace permissions atomically in a transaction so a failed
  // create never leaves the role with zero features.
  const updatedRole = await prisma.$transaction(async (tx) => {
    if (payload.roleFeature !== undefined) {
      await tx.roleFeature.deleteMany({ where: { roleId: id } });
      if (payload.roleFeature.length > 0) {
        await tx.roleFeature.createMany({
          data: payload.roleFeature.map((feature) => ({
            name: feature.name,
            path: feature.path,
            index: feature.index,
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
        adminUser: true,
      },
    });
  });

  return updatedRole;
};

const deleteRoleFromDB = async (id: string) => {
  const role = await prisma.role.findUnique({
    where: { id },
  });

  if (!role) {
    throw new AppError(404, `Role with ID ${id} not found`);
  }

  if (role.name.toLowerCase() === 'super admin') {
    throw new AppError(403, 'Super Admin role cannot be deleted');
  }

  const deletedRole = await prisma.role.delete({
    where: { id },
  });

  return deletedRole;
};


const updateAdminUserRole = async (adminUserId: string, newRoleId: string) => {
  const adminUser = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
  });
  if (!adminUser) {
    throw new Error(`Admin User with ID ${adminUserId} not found`);
  }
  const updatedAdminUser = await prisma.adminUser.update({
    where: { id: adminUserId },
    data: { roleId: newRoleId },
  });
  return updatedAdminUser;
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
}

export const RoleService = {
  createRoleIntoDB,
  getRolesFromDB,
  getRoleByIdFromDB,
  updateRoleIntoDB,
  deleteRoleFromDB,
  updateAdminUserRole,
  deleteAdminUserFromDB
};
