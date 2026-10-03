// ContactUs Routes
import { Router } from 'express';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';
import validateRequest from '../../middlewares/validation';
import { ContactUsController } from './contact-us.controller';
import validation from './contact-us.validation';

const router = Router();

router.post(
  '/',
  auth([can(featureNames.settingsContactUs, 'create')]),
  imageUpload.single('image'),
  validateRequest(validation.create),
  uploadImages,
  ContactUsController.createContactUs,
);

router.get('/', ContactUsController.getAllContactUs);

router.get('/:id', ContactUsController.getContactUsById);

router.put(
  '/:id',
  auth([can(featureNames.settingsContactUs, 'edit')]),
  imageUpload.single('image'),
  validateRequest(validation.update),
  uploadImages,
  ContactUsController.updateContactUs,
);

router.delete(
  '/:id',
  auth([can(featureNames.settingsContactUs, 'delete')]),
  ContactUsController.deleteContactUs,
);

export const ContactUsRoutes = router;
