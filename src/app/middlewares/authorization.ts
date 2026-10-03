import prisma from '../../db/db.config';
import configs from '../configs';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import jwt, { JwtPayload } from 'jsonwebtoken';

const auth = (requiredFeatures?: string[]) => {
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

    if (!isSuperAdmin && requiredFeatures && requiredFeatures.length > 0) {
      // ✅ Compare path instead of name.
      // Roles created from the dashboard store frontend-style paths
      // (`roles` / `settings` / `fivepillars`) while guards use the seed
      // vocabulary (`roles_permissions` / `page-setting` / `fivePillarsOfIslam`),
      // so normalize both sides before comparing.
      const normalizeFeaturePath = (raw: string) => {
        const key = (raw ?? '').toLowerCase();
        const aliases: Record<string, string> = {
          roles: 'roles_permissions',
          settings: 'page-setting',
          fivepillars: 'fivepillarsofislam',
          fivepillar: 'fivepillarsofislam',
        };
        return aliases[key] ?? key;
      };

      const userFeatures = new Set(
        user.role.roleFeature.map((feature) =>
          normalizeFeaturePath(feature.path),
        ),
      );

      const hasRequiredFeatures = requiredFeatures.every((feature) =>
        userFeatures.has(normalizeFeaturePath(feature)),
      );

      if (!hasRequiredFeatures) {
        throw new AppError(403, 'You are not authorized to access this route');
      }
    }

    req.user = decoded as JwtPayload;

    next();
  });
};


export default auth;
