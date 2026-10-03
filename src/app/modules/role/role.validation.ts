import { z } from 'zod';
import {
  FEATURE_KEYS,
  SUPPORTED_ACTIONS,
} from '../../constant/permissions';

// Granular permission entry: only known features, and only actions the
// feature supports.
const permissionEntry = z
  .object({
    feature: z.string().refine((val) => FEATURE_KEYS.includes(val), {
      message: 'Unknown feature',
    }),
    action: z.string(),
  })
  .refine(
    (val) => {
      const actions = SUPPORTED_ACTIONS[val.feature];
      return !!actions && (actions as string[]).includes(val.action);
    },
    { message: 'Action is not supported by this feature' },
  );

// Legacy feature entry (accepted for backwards compatibility; each feature
// grants all of its supported actions).
const legacyFeatureEntry = z.object({
  name: z.string({ required_error: 'Feature name is required' }),
  path: z.string({ required_error: 'Feature path is required' }),
  index: z.number({ required_error: 'Feature index is required' }),
});

const createRoleValidation = z.object({
  body: z
    .object({
      name: z.string({ required_error: 'Role name is required' }),
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
      permissions: z.array(permissionEntry).optional(),
      roleFeature: z.array(legacyFeatureEntry).optional(),
    })
    .refine((val) => val.permissions || val.roleFeature, {
      message: 'Either permissions or roleFeature must be provided',
      path: ['permissions'],
    }),
});

const updateRoleValidation = z.object({
  body: z
    .object({
      name: z.string({ required_error: 'Role name is required' }).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
      permissions: z.array(permissionEntry).optional(),
      roleFeature: z.array(legacyFeatureEntry).optional(),
    })
    .optional(),
});

export const RoleValidation = {
  createRoleValidation,
  updateRoleValidation,
};
