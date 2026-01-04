import { Router } from 'express';
import { featureNames } from '../../constant/seedRoleData';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';

import { OtherAboutUsController } from './other-about-us.controller';
// You can add validation if you create a validation file

const router = Router();

router.post(
  '/',
  auth([featureNames.settings]),
  imageUpload.single('image'),
  uploadImages,
  OtherAboutUsController.createOtherAboutUs
);

router.get('/', OtherAboutUsController.getAllOtherAboutUs);

router.get('/:id', OtherAboutUsController.getOtherAboutUsById);

router.put(
  '/:id',
  auth([featureNames.settings]),
  imageUpload.single('image'),
  uploadImages,
  OtherAboutUsController.updateOtherAboutUs
);

router.delete(
  '/:id',
  auth([featureNames.settings]),
  OtherAboutUsController.deleteOtherAboutUs
);

export const OtherAboutUsRoutes = router;
