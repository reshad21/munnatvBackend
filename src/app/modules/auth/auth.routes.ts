import { Router } from 'express';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';
import validation from '../../middlewares/validation';
import { AuthController } from './auth.controller';
import { authValidations } from './auth.validation';

const router = Router();

router.post(
  '/login',
  validation(authValidations.loginValidation),
  AuthController.login,
);

router.post(
  '/register',
  auth([can(featureNames.rolesAndPermissions, 'assign')]),
  imageUpload.single('profilePhoto'),
  uploadImages,
  validation(authValidations.registerValidation),
  AuthController.register,
);

router.post('/forget-password', AuthController.forgetPassword);

router.post('/reset-password', AuthController.resetPassword);

router.post(
  '/change-password',
  auth([can(featureNames.settings, 'edit')]),
  validation(authValidations.changePasswordValidation),
  AuthController.changePassword,
);

router.post('/refresh-token', AuthController.refreshAccessToken);

router.get(
  '/admin-users',
  auth([can(featureNames.rolesAndPermissions, 'view')]),
  AuthController.getAdminUsers,
);

router.get('/me', auth([]), AuthController.getLoggedAdminDetails);

router.put(
  '/update-profile',
  auth([can(featureNames.profile, 'edit')]),
  imageUpload.single('profilePhoto'),
  uploadImages,
  AuthController.updateProfile,
);

router.get(
  '/admin-users/:id',
  auth([can(featureNames.rolesAndPermissions, 'view')]),
  AuthController.getAdminUserById,
);

router.patch(
  '/admin-users/:id',
  auth([can(featureNames.rolesAndPermissions, 'edit')]),
  imageUpload.single('profilePhoto'),
  uploadImages,
  validation(authValidations.updateAdminUserValidation),
  AuthController.updateAdminUser,
);

router.put(
  '/admin-users/:id/status',
  auth([can(featureNames.rolesAndPermissions, 'status')]),
  AuthController.changeAdminUserStatus,
);

router.delete(
  '/admin-users/:id',
  auth([can(featureNames.rolesAndPermissions, 'delete')]),
  AuthController.deleteAdminUser,
);

export const AuthRoutes = router;
