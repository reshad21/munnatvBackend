
import { getSingleImageUrl } from '../../utils/getImageUrl';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';

const createReview = catchAsync(async (req, res) => {
    const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
    const response = await ReviewService.create({ ...req.body, image });
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Review created successfully',
        data: response,
    });
});

const getAllReviews = catchAsync(async (req, res) => {
    const response = await ReviewService.getAll(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Reviews retrieved successfully',
        data: response,
    });
});

const getReviewById = catchAsync(async (req, res) => {
    const response = await ReviewService.getById(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Review retrieved successfully',
        data: response,
    });
});

const updateReview = catchAsync(async (req, res) => {
    const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
    const response = await ReviewService.update(req.params.id, { ...req.body, image });
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Review updated successfully',
        data: response,
    });
});

const deleteReview = catchAsync(async (req, res) => {
    const response = await ReviewService.delete(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Review deleted successfully',
        data: response,
    });
});

const updateReviewStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    let status = req.body.status;
    if (typeof status === 'string') {
        status = status === 'true' || status === '1';
    }
    const response = await ReviewService.updateStatus(id, status);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Review status updated successfully',
        data: response,
    });
});

export const ReviewController = {
    createReview,
    getAllReviews,
    getReviewById,
    updateReview,
    deleteReview,
    updateReviewStatus,
};
