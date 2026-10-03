import { AdminUser, AdminUserStatus } from '@prisma/client';
import prisma from '../../../db/db.config';
import bcrypt from 'bcryptjs';
import { TLogin } from '../../types/auth.type';
import AppError from '../../errors/AppError';
import { generateToken } from '../../utils/tokenGenerator';
import configs from '../../configs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendEmail } from '../../utils/sendEmail';
import { builderQuery } from '../../builders/prismaBuilderQuery';
import { deleteImageFile } from '../../utils/deleteFile';
import {
  buildPermissionsMap,
  permissionsMapFromLegacyFeatures,
} from '../../constant/permissions';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sanitizeAdmin = <T extends { password?: unknown }>(admin: T) => {
  const { password, ...rest } = admin;
  return rest;
};

const registerIntoDB = async (payload: AdminUser) => {
  const hashedPassword = await bcrypt.hash(payload.password as string, 10);

  const response = await prisma.adminUser.create({
    data: { ...payload, password: hashedPassword },
  });

  return sanitizeAdmin(response);
};

const loginIntoDB = async (payload: TLogin) => {
  const existingAdmin = await prisma.adminUser.findFirst({
    where: {
      email: payload.email,
    },
    include: {
      role: true,
    },
  });

  if (!existingAdmin) {
    throw new AppError(404, 'Admin user not found with this email');
  }

  if (existingAdmin.status === AdminUserStatus.INACTIVE) {
    throw new AppError(403, 'Admin user is inactive. Please contact support.');
  }

  const isPasswordMatch = await bcrypt.compare(
    payload.password as string,
    existingAdmin.password as string,
  );

  if (!isPasswordMatch) {
    throw new AppError(401, 'Password is incorrect');
  }

  const jwtPayload = {
    id: existingAdmin.id,
    email: existingAdmin.email,
    fullName: existingAdmin.fullName,
    role: existingAdmin.role.name,
    status: existingAdmin.status,
    profilePhoto: existingAdmin.profilePhoto,
  };

  const accessToken = generateToken(
    jwtPayload,
    configs.jwtAccessSecret as string,
    configs.jwtAccessExpiresIn as string,
  );

  const refreshToken = generateToken(
    jwtPayload,
    configs.jwtRefreshSecret as string,
    configs.jwtRefreshExpiresIn as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const forgetPasswordIntoDB = async (payload: { email: string }) => {
  const userExists = await prisma.adminUser.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
    include: {
      role: true,
    },
  });

  if (!userExists) {
    throw new AppError(404, 'User not found');
  }

  const jwtPayload = {
    id: userExists.id,
    email: userExists.email,
    fullName: userExists.fullName,
    status: userExists.status,
    role: userExists.role.name,
  };

  const accessToken = generateToken(
    jwtPayload,
    configs.jwtAccessSecret as string,
    '1h',
  );

  const resetLink = `${configs.clientUrl}/reset-password/?id=${userExists.id}&accessToken=${accessToken}`;

  sendEmail(resetLink, payload.email);

  return payload.email;
};

const resetPasswordIntoDB = async (
  id: string,
  password: string,
  token: string,
) => {
  const findUser = await prisma.adminUser.findUnique({
    where: {
      id,
    },
  });

  if (!findUser) {
    throw new AppError(404, 'User not found');
  }

  if (!token) {
    throw new AppError(400, 'Token is required');
  }

  const decoded = jwt.verify(
    token,
    configs.jwtAccessSecret as string,
  ) as JwtPayload;

  if (decoded.id !== findUser.id) {
    throw new AppError(401, 'Invalid token');
  }

  const hashedPassword = await bcrypt.hash(password as string, 10);

  await prisma.adminUser.update({
    where: {
      id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return 'Password reset successfully';
};

const changePasswordIntoDB = async (
  loggedUser: JwtPayload,
  newPassword: string,
  currentPassword: string,
) => {
  const existingAdmin = await prisma.adminUser.findUnique({
    where: {
      id: loggedUser.id,
    },
  });

  if (!existingAdmin) {
    throw new AppError(404, 'Admin user not found');
  }

  const isPasswordMatch = await bcrypt.compare(
    currentPassword as string,
    existingAdmin.password as string,
  );

  if (!isPasswordMatch) {
    throw new AppError(500, 'Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword as string, 10);

  const response = await prisma.adminUser.update({
    where: {
      id: loggedUser.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return response;
};

const refreshAccessTokenIntoDB = async (refreshToken: string) => {
  const decoded = jwt.verify(
    refreshToken,
    configs.jwtRefreshSecret as string,
  ) as JwtPayload;

  const jwtPayload = {
    email: decoded.email,
    fullName: decoded.fullName,
    role: decoded.role,
    status: decoded.status,
    id: decoded.id,
  };

  const newAccessToken = generateToken(
    jwtPayload,
    configs.jwtAccessSecret as string,
    configs.jwtAccessExpiresIn as string,
  );

  return newAccessToken;
};

const getLoggedAdminDetailsFromDB = async (user: JwtPayload) => {
  const response = await prisma.adminUser.findUniqueOrThrow({
    where: {
      id: user.id,
    },
    include: {
      role: {
        include: {
          roleFeature: {
            orderBy: {
              index: 'asc',
            },
          },
          rolePermission: true,
        },
      },
    },
  });

  const permissions =
    response.role.rolePermission.length > 0
      ? buildPermissionsMap(
          response.role.rolePermission.map((p) => ({
            feature: p.feature,
            action: p.action,
          })),
        )
      : permissionsMapFromLegacyFeatures(
          response.role.roleFeature.map((f) => ({ path: f.path })),
        );

  return { ...sanitizeAdmin(response), permissions };
};

const updateAdminProfileIntoDB = async (
  loggedU: JwtPayload,
  payload: Partial<AdminUser>,
) => {
  const existingAdmin = await prisma.adminUser.findUnique({
    where: {
      id: loggedU.id,
    },
  });

  if (!existingAdmin) {
    throw new AppError(404, 'Admin user not found');
  }

  const response = await prisma.adminUser.update({
    where: {
      id: loggedU.id,
    },
    data: payload,
  });

  return sanitizeAdmin(response);
};

const getAdminUsersFromDB = async (query: Record<string, any>) => {
  const usersQuery = builderQuery({
    searchFields: ['fullName', 'email'],
    searchTerm: query.searchTerm,
    orderBy: query.orderBy ? JSON.parse(query.orderBy) : {},
    filter: query.filter ? JSON.parse(query.filter) : {},
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
  });

  const [users, totalCount] = await prisma.$transaction([
    prisma.adminUser.findMany({
      where: usersQuery.where,
      include: {
        role: {
          include: {
            roleFeature: true,
          },
        },
      },
    }),
    prisma.adminUser.count({
      where: usersQuery.where,
    }),
  ]);

  return {
    meta: {
      totalItems: totalCount,
      currentPage: Number(query.page) || 1,
      totalPages: Math.ceil(totalCount / usersQuery.take),
    },
    data: users.map((user) => sanitizeAdmin(user)),
  };
};

const getAdminUserByIdFromDB = async (id: string) => {
  const adminUser = await prisma.adminUser.findUnique({
    where: { id },
    include: {
      role: {
        include: {
          roleFeature: {
            orderBy: { index: 'asc' },
          },
        },
      },
    },
  });

  if (!adminUser) {
    throw new AppError(404, 'Admin user not found');
  }

  return sanitizeAdmin(adminUser);
};

const isSuperAdminRole = (roleName?: string) =>
  (roleName ?? '').toLowerCase() === 'super admin';

const updateAdminUserIntoDB = async (
  loggedUser: JwtPayload,
  id: string,
  payload: Partial<AdminUser> & { password?: string },
) => {
  const target = await prisma.adminUser.findUnique({
    where: { id },
    include: { role: true },
  });

  if (!target) {
    throw new AppError(404, 'Admin user not found');
  }

  const requester = await prisma.adminUser.findUnique({
    where: { id: loggedUser.id },
    include: { role: true },
  });

  if (!requester) {
    throw new AppError(401, 'Requester not found');
  }

  const requesterIsSuperAdmin = isSuperAdminRole(requester.role?.name);
  const targetIsSuperAdmin = isSuperAdminRole(target.role?.name);

  // A non-Super Admin must not touch a Super Admin's account.
  if (targetIsSuperAdmin && !requesterIsSuperAdmin) {
    throw new AppError(
      403,
      "You are not allowed to edit a Super Admin's account",
    );
  }

  if (payload.email && payload.email !== target.email) {
    const emailTaken = await prisma.adminUser.findFirst({
      where: {
        email: payload.email,
        id: { not: id },
      },
    });
    if (emailTaken) {
      throw new AppError(409, 'An admin user with this email already exists');
    }
  }

  let roleId = target.roleId;
  if (payload.roleId && payload.roleId !== target.roleId) {
    const newRole = await prisma.role.findUnique({
      where: { id: payload.roleId },
    });
    if (!newRole) {
      throw new AppError(404, 'Role not found');
    }
    // A non-Super Admin must not promote anyone to Super Admin.
    if (isSuperAdminRole(newRole.name) && !requesterIsSuperAdmin) {
      throw new AppError(
        403,
        'Only a Super Admin can assign the Super Admin role',
      );
    }
    roleId = newRole.id;
  }

  if (
    payload.status &&
    payload.status !== AdminUserStatus.ACTIVE &&
    payload.status !== AdminUserStatus.INACTIVE
  ) {
    throw new AppError(400, 'Status must be ACTIVE or INACTIVE');
  }

  const data: Record<string, unknown> = {};
  if (payload.fullName !== undefined) data.fullName = payload.fullName;
  if (payload.email !== undefined) data.email = payload.email;
  if (payload.status !== undefined) data.status = payload.status;
  if (payload.profilePhoto !== undefined)
    data.profilePhoto = payload.profilePhoto;
  data.roleId = roleId;

  // Password is only updated when a new one is provided (bcrypt, same as creation).
  if (payload.password && payload.password.trim() !== '') {
    data.password = await bcrypt.hash(payload.password, 10);
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data,
    include: {
      role: {
        include: {
          roleFeature: {
            orderBy: { index: 'asc' },
          },
        },
      },
    },
  });

  return sanitizeAdmin(updated);
};

const changeAdminUserStatusIntoDB = async (id: string) => {
  const existingAdminUser = await prisma.adminUser.findUnique({
    where: { id },
  });

  if (!existingAdminUser) {
    throw new AppError(404, 'Admin user not found');
  }

  const response = await prisma.adminUser.update({
    where: { id },
    data: {
      status:
        existingAdminUser.status === AdminUserStatus.ACTIVE
          ? AdminUserStatus.INACTIVE
          : AdminUserStatus.ACTIVE,
    },
  });

  return sanitizeAdmin(response);
};

const deleteAdminUserFromDB = async (loggedUser: JwtPayload, id: string) => {
  const existingAdminUser = await prisma.adminUser.findUnique({
    where: { id },
  });

  if (existingAdminUser?.id === loggedUser.id) {
    throw new AppError(403, 'You cannot delete your own account');
  }

  if (!existingAdminUser) {
    throw new AppError(404, 'Admin user not found');
  }

  const targetWithRole = await prisma.adminUser.findUnique({
    where: { id },
    include: { role: true },
  });

  // Never delete the last remaining Super Admin.
  if (isSuperAdminRole(targetWithRole?.role?.name) && targetWithRole?.roleId) {
    const superAdminCount = await prisma.adminUser.count({
      where: { roleId: targetWithRole.roleId },
    });
    if (superAdminCount <= 1) {
      throw new AppError(
        403,
        'Cannot delete the last remaining Super Admin',
      );
    }
  }

  const response = await prisma.adminUser.delete({
    where: { id },
  });

  if (existingAdminUser.profilePhoto) {
    deleteImageFile(existingAdminUser.profilePhoto);
  }

  return sanitizeAdmin(response);
};

export const AuthServices = {
  registerIntoDB,
  loginIntoDB,
  forgetPasswordIntoDB,
  resetPasswordIntoDB,
  changePasswordIntoDB,
  refreshAccessTokenIntoDB,
  getLoggedAdminDetailsFromDB,
  updateAdminProfileIntoDB,
  getAdminUsersFromDB,
  getAdminUserByIdFromDB,
  updateAdminUserIntoDB,
  changeAdminUserStatusIntoDB,
  deleteAdminUserFromDB,
};
