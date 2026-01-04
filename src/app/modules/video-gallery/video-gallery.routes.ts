import { Router } from 'express';
import auth from '../../middlewares/authorization';
import { featureNames } from '../../constant/seedRoleData';
import validation from '../../middlewares/validation';
import { createVideoGallerySchema, updateVideoGallerySchema } from './video-gallery.validation';
import { VideoGalleryController } from './video-gallery.controller';


const router = Router();

router.post(
    '/',
    auth([featureNames.videoGallery]),
    validation(createVideoGallerySchema),
    VideoGalleryController.createVideo,
);

router.get('/', VideoGalleryController.getAllVideos);

router.get('/:id', VideoGalleryController.getVideoById);

router.put(
    '/:id',
    auth([featureNames.videoGallery]),
    validation(updateVideoGallerySchema),
    VideoGalleryController.updateVideo,
);

router.delete(
    '/:id',
    auth([featureNames.videoGallery]),
    VideoGalleryController.deleteVideo,
);

export const VideoGalleryRoutes = router;
