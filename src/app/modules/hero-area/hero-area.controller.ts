
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HeroAreaService } from './hero-area.service';
import { getMultipleImageUrls } from '../../utils/getImageUrl';
import AppError from '../../errors/AppError';

const createHeroSection = catchAsync(async (req, res) => {
  const files = req.files;
  if (!files) {
    throw new AppError(404, 'Please upload images');
  }
  const imageFiles = Array.isArray(files) ? files : Object.values(files).flat();
  const imageUrls = getMultipleImageUrls(req, imageFiles);
  const heroImages = imageUrls.map((image) => ({ image }));
  const response = await HeroAreaService.create({
    ...req.body,
    images: heroImages,
  });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Hero section created successfully',
    data: response,
  });
});

const getAllHeroSections = catchAsync(async (req, res) => {
  const response = await HeroAreaService.getAll();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hero sections retrieved successfully',
    data: response,
  });
});

const getHeroSectionById = catchAsync(async (req, res) => {
  const response = await HeroAreaService.getById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hero section retrieved successfully',
    data: response,
  });
});

const updateHeroSection = catchAsync(async (req, res) => {
  const files = req.files;
  const existingImages = req.body.existingImages;
  const heroData = req.body.data ? JSON.parse(req.body.data) : req.body;

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

  const response = await HeroAreaService.update(
    heroData.id,
    heroData,
    existingImageUrls,
    newImageUrls
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hero section updated successfully',
    data: response,
  });
});

const deleteHeroSection = catchAsync(async (req, res) => {
  const response = await HeroAreaService.delete(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hero section deleted successfully',
    data: response,
  });
});

export const HeroAreaController = {
  createHeroSection,
  getAllHeroSections,
  getHeroSectionById,
  updateHeroSection,
  deleteHeroSection,
};
