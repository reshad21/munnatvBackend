import prisma from '../../db/db.config';
import configs from '../configs';
import { seedRoleAdminData } from '../constant/seedRoleData';
import bcrypt from 'bcryptjs';

/**
 * Idempotent Super Admin bootstrap. Safe to run on every startup:
 * - Creates the Super Admin role with every seed feature if missing.
 * - Adds any missing seed features to an existing Super Admin role
 *   (never removes custom features, never creates duplicates).
 * - Creates the .env admin user if missing, otherwise re-assigns it to the
 *   Super Admin role so it always keeps full access.
 */
export const seedRoleAdmin = async () => {
  try {
    const adminEmail = configs.adminEmail as string | undefined;
    if (!adminEmail) {
      console.error('Seed skipped: ADMIN_EMAIL is not set');
      return;
    }

    let superAdmin = await prisma.role.findUnique({
      where: { name: seedRoleAdminData.name },
      include: { roleFeature: true },
    });

    if (!superAdmin) {
      superAdmin = await prisma.role.create({
        data: {
          name: seedRoleAdminData.name,
          roleFeature: {
            create: seedRoleAdminData.roleFeature.map((roleFeature) => ({
              name: roleFeature.name,
              path: roleFeature.path,
              index: roleFeature.index,
            })),
          },
        },
        include: { roleFeature: true },
      });
      console.log('Seeded Super Admin role with all features');
    } else {
      const existingPaths = new Set(
        superAdmin.roleFeature.map((feature) => feature.path),
      );
      const missing = seedRoleAdminData.roleFeature.filter(
        (feature) => !existingPaths.has(feature.path),
      );
      if (missing.length > 0) {
        await prisma.roleFeature.createMany({
          data: missing.map((feature) => ({
            name: feature.name,
            path: feature.path,
            index: feature.index,
            roleId: superAdmin!.id,
          })),
        });
        console.log(
          `Seed repaired Super Admin role: added ${missing.length} missing feature(s)`,
        );
      }
    }

    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: adminEmail },
    });

    const plainPassword =
      (configs.adminPass as string | undefined) ||
      (configs.password as string | undefined);
    if (!plainPassword) {
      console.error('Seed skipped: ADMIN_PASS/DEFAULT_PASS is not set');
      return;
    }

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      await prisma.adminUser.create({
        data: {
          fullName: (configs.adminFullName as string) || 'Admin',
          email: adminEmail,
          password: hashedPassword,
          roleId: superAdmin.id,
        },
      });
      console.log(`Seeded admin user ${adminEmail} with Super Admin role`);
    } else if (existingAdmin.roleId !== superAdmin.id) {
      await prisma.adminUser.update({
        where: { email: adminEmail },
        data: { roleId: superAdmin.id },
      });
      console.log(`Seed re-assigned ${adminEmail} to Super Admin role`);
    }
  } catch (error) {
    console.error('Seed Super Admin failed:', error);
  }
};
