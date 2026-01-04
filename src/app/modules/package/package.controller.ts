import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import { getMultipleImageUrls, getSingleImageUrl } from '../../utils/getImageUrl';
import sendResponse from '../../utils/sendResponse';
import { PackageService } from './package.service';

const createPackage = catchAsync(async (req, res) => {
    const files = req.files;

    if (!files) {
        throw new AppError(404, 'Please upload images');
    }

    const imageFiles = Array.isArray(files) ? files : Object.values(files).flat();
    const imageUrls = getMultipleImageUrls(req, imageFiles);

    const packageImages = imageUrls.map((image) => ({
        image,
    }));
    const response = await PackageService.create({
        ...req.body,
        packageImages
    });
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Package created successfully',
        data: response,
    });
});

const getAllPackages = catchAsync(async (req, res) => {
    const response = await PackageService.getAll(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Packages retrieved successfully',
        data: response,
    });
});

const getPackageById = catchAsync(async (req, res) => {
    const response = await PackageService.getById(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Package retrieved successfully',
        data: response,
    });
});

const updatePackage = catchAsync(async (req, res) => {
    const files = req.files;
    const existingImages = req.body.existingImages;
    
    // Parse data if it's sent as JSON string
    const packageData = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    // Handle new image uploads
    let newImageUrls: string[] = [];
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
    let existingImageUrls: string[] = [];
    if (existingImages) {
        existingImageUrls = typeof existingImages === 'string' 
            ? JSON.parse(existingImages) 
            : Array.isArray(existingImages) 
            ? existingImages 
            : [existingImages];
    }
    
    // Update package with images
    const response = await PackageService.update(
        req.params.id, 
        packageData, 
        existingImageUrls, 
        newImageUrls
    );
    
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Package updated successfully',
        data: response,
    });
});

const deletePackage = catchAsync(async (req, res) => {
    const response = await PackageService.delete(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Package deleted successfully',
        data: response,
    });
});

const addPackageImage = catchAsync(async (req, res) => {
  const imageUrl = getSingleImageUrl(req, req.file);

  const response = await PackageService.packageImageCreate({
    image: imageUrl,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Package image added successfully',
    data: response,
  });
});

const deletePackageImage = catchAsync(async (req, res) => {
  const response = await PackageService.deletePackageImage(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Package image deleted successfully',
    data: response,
  });
});


const updatePackageStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  let status = req.body.status;
  if (typeof status === 'string') {
    status = status === 'true' || status === '1';
  }
  const response = await PackageService.updateStatus(id, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Package status updated successfully',
    data: response,
  });
});

export const PackageController = {
    createPackage,
    getAllPackages,
    getPackageById,
    updatePackage,
    deletePackage,
    addPackageImage,
    deletePackageImage,
    updatePackageStatus
};
