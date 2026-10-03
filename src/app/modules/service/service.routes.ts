import { Router } from 'express';
import auth from '../../middlewares/authorization';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { ServiceController } from './service.controller';
import { ServiceValidation } from './service.validation';
import { imageUpload, uploadImages } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth([can(featureNames.services, 'create')]),
  imageUpload.single('image'),
  validation(ServiceValidation.createServiceValidation),
  uploadImages,
  ServiceController.createService,
);

router.get('/', ServiceController.getAllServices);

router.get('/:id', ServiceController.getServiceById);

router.put(
  '/:id',
  auth([can(featureNames.services, 'edit')]),
  imageUpload.single('image'),
  validation(ServiceValidation.updateServiceValidation),
  uploadImages,
  ServiceController.updateService,
);

router.delete(
  '/:id',
  auth([can(featureNames.services, 'delete')]),
  ServiceController.deleteService,
);

router.patch(
  '/:id/status',
  auth([can(featureNames.services, 'status')]),
  ServiceController.updateServiceStatus,
);

export const ServiceRoutes = router;
