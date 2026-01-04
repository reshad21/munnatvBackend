
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OtherAboutUsService } from './other-about-us.service';
import { getSingleImageUrl } from '../../utils/getImageUrl';

const createOtherAboutUs = catchAsync(async (req, res) => {
  const imageUrl = getSingleImageUrl(req, req.file);
  const response = await OtherAboutUsService.create({
    ...req.body,
    image: imageUrl,
  });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Other About Us created successfully',
    data: response,
  });
});

const getAllOtherAboutUs = catchAsync(async (req, res) => {
  const response = await OtherAboutUsService.getOtherAboutUsFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Other About Us retrieved successfully',
    data: response,
  });
});

const getOtherAboutUsById = catchAsync(async (req, res) => {
  const response = await OtherAboutUsService.getById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Other About Us retrieved successfully',
    data: response,
  });
});

const updateOtherAboutUs = catchAsync(async (req, res) => {
  const { id } = req.params;
  const imageUrl = getSingleImageUrl(req, req.file);
  const response = await OtherAboutUsService.update(id, {
    ...req.body,
    image: imageUrl || req.body.image,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Other About Us updated successfully',
    data: response,
  });
});

const deleteOtherAboutUs = catchAsync(async (req, res) => {
  const response = await OtherAboutUsService.delete(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Other About Us deleted successfully',
    data: response,
  });
});

export const OtherAboutUsController = {
  createOtherAboutUs,
  getAllOtherAboutUs,
  getOtherAboutUsById,
  updateOtherAboutUs,
  deleteOtherAboutUs,
};
