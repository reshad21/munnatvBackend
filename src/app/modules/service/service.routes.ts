import { Router } from 'express';
import auth from '../../middlewares/authorization';
import { featureNames } from '../../constant/seedRoleData';
import validation from '../../middlewares/validation';
import { ServiceController } from './service.controller';
import { ServiceValidation } from './service.validation';
import { imageUpload, uploadImages } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth([featureNames.services]),
  imageUpload.single('image'),
  validation(ServiceValidation.createServiceValidation),
  uploadImages,
  ServiceController.createService,
);

router.get('/', ServiceController.getAllServices);

router.get('/:id', ServiceController.getServiceById);

router.put(
  '/:id',
  auth([featureNames.services]),
  imageUpload.single('image'),
  validation(ServiceValidation.updateServiceValidation),
  uploadImages,
  ServiceController.updateService,
);

router.delete(
  '/:id',
  auth([featureNames.services]),
  ServiceController.deleteService,
);

router.patch(
  '/:id/status',
  auth([featureNames.services]),
  ServiceController.updateServiceStatus,
);

export const ServiceRoutes = router;
