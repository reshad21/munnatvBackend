import { Router } from 'express';
import auth from '../../middlewares/authorization';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { RoleValidation } from './role.validation';
import { RoleController } from './role.controller';

const router = Router();

router.post(
  '/',
  auth([can(featureNames.rolesAndPermissions, 'create')]),
  validation(RoleValidation.createRoleValidation),
  RoleController.createRole,
);

router.get(
  '/',
  auth([can(featureNames.rolesAndPermissions, 'view')]),
  RoleController.getRoles,
);

router.get(
  '/:id',
  auth([can(featureNames.rolesAndPermissions, 'view')]),
  RoleController.getRoleById,
);

// Assign admins to roles
router.patch(
  '/admin-user/:adminUserId/role/:roleId',
  auth([can(featureNames.rolesAndPermissions, 'assign')]),
  RoleController.updateAdminUserRole,
);

router.put(
  '/:id',
  auth([can(featureNames.rolesAndPermissions, 'edit')]),
  validation(RoleValidation.updateRoleValidation),
  RoleController.updateRole,
);

router.delete(
  '/:id',
  auth([can(featureNames.rolesAndPermissions, 'delete')]),
  RoleController.deleteRole,
);
router.delete(
  '/admin-user/:id',
  auth([can(featureNames.rolesAndPermissions, 'delete')]),
  RoleController.deleteAdminUser,
);

export const RoleRoutes = router;
