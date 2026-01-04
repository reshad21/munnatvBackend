import { Router } from 'express';
import { featureNames } from '../../constant/seedRoleData';
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
  auth([featureNames.profile]),
  imageUpload.single('profilePhoto'),
  uploadImages,
  validation(authValidations.registerValidation),
  AuthController.register,
);

router.post('/forget-password', AuthController.forgetPassword);

router.post('/reset-password', AuthController.resetPassword);

router.post(
  '/change-password',
  auth([featureNames.settings]),
  validation(authValidations.changePasswordValidation),
  AuthController.changePassword,
);

router.post('/refresh-token', AuthController.refreshAccessToken);

router.get(
  '/admin-users',
  // auth([featureNames.profile]),
  AuthController.getAdminUsers,
);

router.get('/me', auth([]), AuthController.getLoggedAdminDetails);

router.put(
  '/update-profile',
  auth([featureNames.profile]),
  imageUpload.single('profilePhoto'),
  uploadImages,
  AuthController.updateProfile,
);

router.put(
  '/admin-users/:id/status',
  auth([featureNames.profile]),
  AuthController.changeAdminUserStatus,
);

router.delete(
  '/admin-users/:id',
  auth([featureNames.profile]),
  AuthController.deleteAdminUser,
);

export const AuthRoutes = router;
