import catchAsync from '../../utils/catchAsync';
import { getSingleImageUrl } from '../../utils/getImageUrl';
import sendResponse from '../../utils/sendResponse';
import { GalleryService } from './gallery.service';

const createGallery = catchAsync(async (req, res) => {
    const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
    const response = await GalleryService.create({ ...req.body, image: image });
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Gallery created successfully',
        data: response,
    });
});

const getAllGalleries = catchAsync(async (req, res) => {
    const response = await GalleryService.getAll(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Galleries retrieved successfully',
        data: response,
    });
});

const getGalleryById = catchAsync(async (req, res) => {
    const response = await GalleryService.getById(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Gallery retrieved successfully',
        data: response,
    });
});

const updateGallery = catchAsync(async (req, res) => {
    const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
    const response = await GalleryService.update(req.params.id, { ...req.body, image: image });
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Gallery updated successfully',
        data: response,
    });
});

const deleteGallery = catchAsync(async (req, res) => {
    const response = await GalleryService.delete(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Gallery deleted successfully',
        data: response,
    });
});


const updateGalleryStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
	// Accept status from form-data or body
	let status = req.body.status;
	if (typeof status === 'string') {
		status = status === 'true' || status === '1';
	}
	const response = await GalleryService.updateStatus(id, status);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: 'Gallery status updated successfully',
		data: response,
	});
});

export const GalleryController = {
    createGallery,
    getAllGalleries,
    getGalleryById,
    updateGallery,
    deleteGallery,
    updateGalleryStatus
};
