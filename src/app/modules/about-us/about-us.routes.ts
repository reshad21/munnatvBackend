import { Router } from 'express';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';
import validation from '../../middlewares/validation';
import { AboutUsController } from './about-us.controller';
import { AboutUsValidation } from './about-us.validation';

const router = Router();

router.post(
  '/',
  auth([can(featureNames.settingsAboutUs, 'create')]),
  imageUpload.array('images', 10),
  uploadImages,
  validation(AboutUsValidation.createAboutUsValidation),
  AboutUsController.crateAboutSection,
);

router.get('/', AboutUsController.getAboutSection);

router.put(
  '/:id',
  auth([can(featureNames.settingsAboutUs, 'edit')]),
  imageUpload.array('images', 10),
  uploadImages,
  AboutUsController.updateAboutSection,
);

router.post(
  '/image',
  auth([can(featureNames.settingsAboutUs, 'create')]),
  imageUpload.single('image'),
  uploadImages,
  AboutUsController.addAboutSectionImage,
);

router.delete(
  '/image/:id',
  auth([can(featureNames.settingsAboutUs, 'delete')]),
  AboutUsController.deleteAboutSectionImage,
);

export const AboutUsRoutes = router;
