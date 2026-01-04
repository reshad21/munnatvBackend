import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import {
  getMultipleImageUrls,
  getSingleImageUrl,
} from '../../utils/getImageUrl';
import sendResponse from '../../utils/sendResponse';
import { AboutUsService } from './about-us.service';

const crateAboutSection = catchAsync(async (req, res) => {
  const files = req.files;
  if (!files) {
    throw new AppError(404, 'Please upload images');
  }
  const imageFiles = Array.isArray(files) ? files : Object.values(files).flat();
  const imageUrls = getMultipleImageUrls(req, imageFiles);
  const aboutUsImages = imageUrls.map((image) => ({ image }));
  const response = await AboutUsService.createAboutUsIntoDB({
    ...req.body,
    aboutUsImages,
  });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'About Us section created successfully',
    data: response,
  });
});

const getAboutSection = catchAsync(async (req, res) => {
  const response = await AboutUsService.getAboutUsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'About Us section retrieved successfully',
    data: response,
  });
});

const updateAboutSection = catchAsync(async (req, res) => {
  const files = req.files;
  const existingImages = req.body.existingImages;
  // Parse data if it's sent as JSON string
  const aboutUsData = req.body.data ? JSON.parse(req.body.data) : req.body;

  // Handle new image uploads
  let newImageUrls: string[] | undefined = [];
  if (Array.isArray(files) && files.length > 0) {
    const imageFiles = files;
    newImageUrls = getMultipleImageUrls(req, imageFiles);
  } else if (files && !Array.isArray(files)) {
    const imageFiles = Object.values(files).flat();
    if (imageFiles.length > 0) {
      newImageUrls = getMultipleImageUrls(req, imageFiles);
    }
  }

  // Parse existing images if sent as JSON string
  let existingImageUrls = [];
  if (existingImages) {
    existingImageUrls = typeof existingImages === 'string'
      ? JSON.parse(existingImages)
      : Array.isArray(existingImages)
      ? existingImages
      : [existingImages];
  }

  // Update AboutUs with images
  const response = await AboutUsService.updateAboutUs(
    aboutUsData.id,
    aboutUsData,
    existingImageUrls,
    newImageUrls
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'About Us section updated successfully',
    data: response,
  });
});

const addAboutSectionImage = catchAsync(async (req, res) => {
  const imageUrl = getSingleImageUrl(req, req.file);
  const response = await AboutUsService.addAboutUsImage({ image: imageUrl });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'About Us section image added successfully',
    data: response,
  });
});

const deleteAboutSectionImage = catchAsync(async (req, res) => {
  const response = await AboutUsService.deleteAboutUsImage(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'About Us section image deleted successfully',
    data: response,
  });
});

export const AboutUsController = {
  crateAboutSection,
  getAboutSection,
  updateAboutSection,
  addAboutSectionImage,
  deleteAboutSectionImage,
};
