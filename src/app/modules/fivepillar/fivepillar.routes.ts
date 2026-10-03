import { Router } from 'express';
import auth from '../../middlewares/authorization';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import { imageUpload, uploadImages } from '../../middlewares/multer';
import validation from '../../middlewares/validation';
import { FivePillarValidation } from './fivepillar.validation';
import { FivePillarController } from './fivepillar.controller';

const router = Router();

router.post(
  '/',
  auth([can(featureNames.fivePillarsOfIslam, 'create')]),
  imageUpload.single('image'),
  validation(FivePillarValidation.createFivePillarValidation),
  uploadImages,
  FivePillarController.createFivePillar,
);

router.get('/', FivePillarController.getAllFivePillars);


router.patch(
  '/:id/status',
  auth([can(featureNames.fivePillarsOfIslam, 'status')]),
  FivePillarController.updateFivePillarStatus,
);

router.get('/:id', FivePillarController.getFivePillarById);

router.put(
  '/:id',
  auth([can(featureNames.fivePillarsOfIslam, 'edit')]),
  imageUpload.single('image'),
  validation(FivePillarValidation.updateFivePillarValidation),
  uploadImages,
  FivePillarController.updateFivePillar,
);

router.delete(
  '/:id',
  auth([can(featureNames.fivePillarsOfIslam, 'delete')]),
  FivePillarController.deleteFivePillar,
);

export const FivePillarRoutes = router;
