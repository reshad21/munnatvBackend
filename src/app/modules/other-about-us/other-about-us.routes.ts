import { Router } from 'express';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';

import { OtherAboutUsController } from './other-about-us.controller';
// You can add validation if you create a validation file

const router = Router();

router.post(
  '/',
  auth([can(featureNames.settings, 'create')]),
  imageUpload.single('image'),
  uploadImages,
  OtherAboutUsController.createOtherAboutUs
);

router.get('/', OtherAboutUsController.getAllOtherAboutUs);

router.get('/:id', OtherAboutUsController.getOtherAboutUsById);

router.put(
  '/:id',
  auth([can(featureNames.settings, 'edit')]),
  imageUpload.single('image'),
  uploadImages,
  OtherAboutUsController.updateOtherAboutUs
);

router.delete(
  '/:id',
  auth([can(featureNames.settings, 'delete')]),
  OtherAboutUsController.deleteOtherAboutUs
);

export const OtherAboutUsRoutes = router;
