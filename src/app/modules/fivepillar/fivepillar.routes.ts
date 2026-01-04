import { Router } from 'express';
import auth from '../../middlewares/authorization';
import { featureNames } from '../../constant/seedRoleData';
import { imageUpload, uploadImages } from '../../middlewares/multer';
import validation from '../../middlewares/validation';
import { FivePillarValidation } from './fivepillar.validation';
import { FivePillarController } from './fivepillar.controller';

const router = Router();

router.post(
  '/',
  auth([featureNames.fivePillarsOfIslam]),
  imageUpload.single('image'),
  validation(FivePillarValidation.createFivePillarValidation),
  uploadImages,
  FivePillarController.createFivePillar,
);

router.get('/', FivePillarController.getAllFivePillars);


router.patch(
  '/:id/status',
  auth([featureNames.fivePillarsOfIslam]),
  FivePillarController.updateFivePillarStatus,
);

router.get('/:id', FivePillarController.getFivePillarById);

router.put(
  '/:id',
  auth([featureNames.fivePillarsOfIslam]),
  imageUpload.single('image'),
  validation(FivePillarValidation.updateFivePillarValidation),
  uploadImages,
  FivePillarController.updateFivePillar,
);

router.delete(
  '/:id',
  auth([featureNames.fivePillarsOfIslam]),
  FivePillarController.deleteFivePillar,
);

router.delete(
  '/:id',
  auth([featureNames.fivePillarsOfIslam]),
  FivePillarController.deleteFivePillar,
);

export const FivePillarRoutes = router;
