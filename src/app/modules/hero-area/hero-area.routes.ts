import { Router } from 'express';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';
import { HeroAreaController } from './hero-area.controller';

const router = Router();

router.post(
  '/',
  auth([can(featureNames.settingsHeroArea, 'create')]),
  imageUpload.array('images', 10),
  uploadImages,
  HeroAreaController.createHeroSection
);

router.get('/', HeroAreaController.getAllHeroSections);

router.get('/:id', HeroAreaController.getHeroSectionById);

router.put(
  '/:id',
  auth([can(featureNames.settingsHeroArea, 'edit')]),
  imageUpload.array('images', 10),
  uploadImages,
  HeroAreaController.updateHeroSection
);

router.delete(
  '/:id',
  auth([can(featureNames.settingsHeroArea, 'delete')]),
  HeroAreaController.deleteHeroSection
);

export const HeroAreaRoutes = router;
