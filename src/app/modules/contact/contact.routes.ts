import validation from '../../middlewares/validation';
import { ContactController } from './contact.controller';
import { ContactValidation } from './contact.validation';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import auth from '../../middlewares/authorization';

import { Router } from 'express';

const router = Router();

router.post(
  '/',
  validation(ContactValidation.createContactValidation),
  ContactController.createContact,
);

router.get('/', ContactController.getAllContacts);

router.get('/:id', ContactController.getContactById);

router.delete(
  '/:id',
  auth([can(featureNames.contacts, 'delete')]),
  ContactController.deleteContact,
);

export const ContactRoutes = router;
