import prisma from '../../db/db.config';
import configs from '../configs';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {
  PermissionAction,
  buildPermissionsMap,
  canonicalFeatureKey,
  hasPermission,
  permissionsMapFromLegacyFeatures,
} from '../constant/permissions';

export type PermissionRequirement =
  | string
  | { feature: string; action: PermissionAction };

/**
 * Route guard. Each entry is either:
 * - a plain feature key (legacy: any access to the feature is enough), or
 * - { feature, action } for granular per-action enforcement.
 * Super Admin bypasses all checks. An empty array means "any authenticated user".
 * Roles without granular rows fall back to their legacy features
 * (each stored feature grants all of its supported actions).
 */
const auth = (requirements?: PermissionRequirement[]) => {
  return catchAsync(async (req, res, next) => {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: 'You are not authorized to access this route',
      });
    }

    const token = bearerToken.split(' ')[1];

    const decoded = jwt.verify(token, configs.jwtAccessSecret as string) as JwtPayload;

    const { email } = decoded;

    const user = await prisma.adminUser.findFirst({
      where: { email },
      include: {
        role: {
          include: {
            roleFeature: true,
            rolePermission: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Super Admin bypasses all feature checks.
    const isSuperAdmin =
      user.role?.name?.toLowerCase() === 'super admin';

    if (!isSuperAdmin && requirements && requirements.length > 0) {
      const granular = user.role.rolePermission ?? [];
      const permissionsMap =
        granular.length > 0
          ? buildPermissionsMap(
              granular.map((p) => ({ feature: p.feature, action: p.action })),
            )
          : permissionsMapFromLegacyFeatures(
              (user.role.roleFeature ?? []).map((f) => ({ path: f.path })),
            );

      const missing = requirements.filter((requirement) => {
        if (typeof requirement === 'string') {
          const key = canonicalFeatureKey(requirement);
          return !permissionsMap[key] || permissionsMap[key].length === 0;
        }
        return !hasPermission(
          permissionsMap,
          requirement.feature,
          requirement.action,
        );
      });

      if (missing.length > 0) {
        const describe = (requirement: PermissionRequirement) =>
          typeof requirement === 'string'
            ? `'${canonicalFeatureKey(requirement)}' access`
            : `'${requirement.action}' permission on '${canonicalFeatureKey(requirement.feature)}'`;
        throw new AppError(
          403,
          `Forbidden: missing ${missing.map(describe).join(', ')}`,
        );
      }
    }

    req.user = decoded as JwtPayload;

    next();
  });
};

export default auth;
