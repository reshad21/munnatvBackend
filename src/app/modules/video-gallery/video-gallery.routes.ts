import { Router } from 'express';
import auth from '../../middlewares/authorization';
import { featureNames } from '../../constant/seedRoleData';
import { can } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { createVideoGallerySchema, updateVideoGallerySchema } from './video-gallery.validation';
import { VideoGalleryController } from './video-gallery.controller';


const router = Router();

router.post(
    '/',
    auth([can(featureNames.videoGallery, 'create')]),
    validation(createVideoGallerySchema),
    VideoGalleryController.createVideo,
);

router.get('/', VideoGalleryController.getAllVideos);

router.patch(
    '/:id/status',
    auth([can(featureNames.videoGallery, 'status')]),
    VideoGalleryController.updateVideoGalleryStatus,
);

router.get('/:id', VideoGalleryController.getVideoById);

router.put(
    '/:id',
    auth([can(featureNames.videoGallery, 'edit')]),
    validation(updateVideoGallerySchema),
    VideoGalleryController.updateVideo,
);

router.delete(
    '/:id',
    auth([can(featureNames.videoGallery, 'delete')]),
    VideoGalleryController.deleteVideo,
);

export const VideoGalleryRoutes = router;
