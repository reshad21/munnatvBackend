import express from 'express';
import { GalleryController } from './gallery.controller';
// import { GalleryValidation } from './gallery.validation'; // Uncomment if you add validation
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';

const router = express.Router();

router.post(
    '/',
    auth([can(featureNames.gallery, 'create')]),
    imageUpload.single('image'),
    uploadImages,
    // validation(GalleryValidation.createGalleryValidation), // Uncomment if you add validation
    GalleryController.createGallery
);

router.get('/', GalleryController.getAllGalleries);
router.get('/:id', GalleryController.getGalleryById);
router.patch(
  '/:id/status',
  auth([can(featureNames.gallery, 'status')]),
  GalleryController.updateGalleryStatus,
);
router.put(
    '/:id',
    imageUpload.single('image'),
    uploadImages,
    auth([can(featureNames.gallery, 'edit')]),
    // validation(GalleryValidation.updateGalleryValidation), // Uncomment if you add validation
    GalleryController.updateGallery
);
router.delete(
    '/:id',
    auth([can(featureNames.gallery, 'delete')]),
    GalleryController.deleteGallery
);

export const GalleryRoutes = router;
