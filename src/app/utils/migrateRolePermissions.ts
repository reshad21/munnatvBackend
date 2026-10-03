import prisma from '../../db/db.config';
import {
  SUPPORTED_ACTIONS,
  canonicalFeatureKey,
  isKnownFeature,
} from '../constant/permissions';

/**
 * Idempotent migration of legacy role features to granular permissions.
 * - Rewrites legacy feature paths (roles/settings/fivepillars/...) to the
 *   canonical vocabulary so stored keys match everywhere.
 * - Converts every stored feature into all of its supported actions, so no
 *   existing role loses access.
 * Safe to run on every startup (skips rows that already exist).
 */
export const migrateRolePermissions = async () => {
  try {
    const roles = await prisma.role.findMany({
      include: { roleFeature: true, rolePermission: true },
    });

    for (const role of roles) {
      // 1. Canonicalize legacy feature paths in place.
      for (const feature of role.roleFeature) {
        const canonical = canonicalFeatureKey(feature.path);
        if (canonical !== feature.path) {
          await prisma.roleFeature.update({
            where: { id: feature.id },
            data: { path: canonical },
          });
        }
      }

      // 2. Ensure a permission row per (feature, supported action).
      const existing = new Set(
        role.rolePermission.map((p) => `${p.feature}:${p.action}`),
      );
      const missing: { feature: string; action: string; roleId: string }[] = [];
      for (const feature of role.roleFeature) {
        const key = canonicalFeatureKey(feature.path);
        if (!isKnownFeature(key)) continue;
        for (const action of SUPPORTED_ACTIONS[key]) {
          if (!existing.has(`${key}:${action}`)) {
            existing.add(`${key}:${action}`);
            missing.push({ feature: key, action, roleId: role.id });
          }
        }
      }
      if (missing.length > 0) {
        await prisma.rolePermission.createMany({
          data: missing,
          skipDuplicates: true,
        });
        console.log(
          `Migrated role "${role.name}": added ${missing.length} permission(s)`,
        );
      }
    }
  } catch (error) {
    console.error('Role permission migration failed:', error);
  }
};
