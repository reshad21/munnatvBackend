import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { VideoGalleryService } from './video-gallery.service';


const createVideo = catchAsync(async (req, res) => {
    const videoUrl = req.body.videoUrl;
    const response = await VideoGalleryService.create({ ...req.body, videoUrl });
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Video added successfully',
        data: response,
    });
});

const getAllVideos = catchAsync(async (req, res) => {
    const response = await VideoGalleryService.getAll(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Videos retrieved successfully',
        data: response,
    });
});

const getVideoById = catchAsync(async (req, res) => {
    const response = await VideoGalleryService.getById(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Video retrieved successfully',
        data: response,
    });
});


const updateVideo = catchAsync(async (req, res) => {
    const videoUrl = req.body.videoUrl;
    const response = await VideoGalleryService.update(req.params.id, { ...req.body, videoUrl });
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Video updated successfully',
        data: response,
    });
});

const deleteVideo = catchAsync(async (req, res) => {
    const response = await VideoGalleryService.delete(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Video deleted successfully',
        data: response,
    });
});



const updateVideoGalleryStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  let status = req.body.status;
  if (typeof status === 'string') {
    status = status === 'true' || status === '1';
  }
  const response = await VideoGalleryService.updateStatus(id, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video status updated successfully',
    data: response,
  });
});

export const VideoGalleryController = {
    createVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    updateVideoGalleryStatus
};
