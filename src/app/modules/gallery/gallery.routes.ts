import express from 'express';
import { GalleryController } from './gallery.controller';
// import { GalleryValidation } from './gallery.validation'; // Uncomment if you add validation
import { featureNames } from '../../constant/seedRoleData';
import auth from '../../middlewares/authorization';
import { imageUpload, uploadImages } from '../../middlewares/multer';

const router = express.Router();

router.post(
    '/',
    auth([featureNames.gallery]),
    imageUpload.single('image'),
    uploadImages,
    // validation(GalleryValidation.createGalleryValidation), // Uncomment if you add validation
    GalleryController.createGallery
);

router.get('/', GalleryController.getAllGalleries);
router.get('/:id', GalleryController.getGalleryById);
router.patch(
  '/:id/status',
  GalleryController.updateGalleryStatus,
);
router.put(
    '/:id',
    imageUpload.single('image'),
    uploadImages,
    auth([featureNames.gallery]),
    // validation(GalleryValidation.updateGalleryValidation), // Uncomment if you add validation
    GalleryController.updateGallery
);
router.delete(
    '/:id',
    auth([featureNames.gallery]),
    GalleryController.deleteGallery
);

export const GalleryRoutes = router;

