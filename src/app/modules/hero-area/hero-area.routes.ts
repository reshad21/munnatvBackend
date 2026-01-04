import { Router } from 'express';
import { featureNames } from '../../constant/seedRoleData';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';
import { HeroAreaController } from './hero-area.controller';

const router = Router();

router.post(
  '/',
  auth([featureNames.settings]),
  imageUpload.array('images', 10),
  uploadImages,
  HeroAreaController.createHeroSection
);

router.get('/', HeroAreaController.getAllHeroSections);

router.get('/:id', HeroAreaController.getHeroSectionById);

router.put(
  '/:id',
  auth([featureNames.settings]),
  imageUpload.array('images', 10),
  uploadImages,
  HeroAreaController.updateHeroSection
);

router.delete(
  '/:id',
  auth([featureNames.settings]),
  HeroAreaController.deleteHeroSection
);

export const HeroAreaRoutes = router;
