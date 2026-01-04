import catchAsync from '../../utils/catchAsync';
import { getSingleImageUrl } from '../../utils/getImageUrl';
import sendResponse from '../../utils/sendResponse';
import { ServiceService } from './service.service';

const createService = catchAsync(async (req, res) => {
  const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
  const response = await ServiceService.create({ ...req.body, image });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Service created successfully',
    data: response,
  });
});

const getAllServices = catchAsync(async (req, res) => {
  const response = await ServiceService.getAll(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Services retrieved successfully',
    data: response,
  });
});

const getServiceById = catchAsync(async (req, res) => {
  const response = await ServiceService.getById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service retrieved successfully',
    data: response,
  });
});

const updateService = catchAsync(async (req, res) => {
	const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
  const response = await ServiceService.update(req.params.id, { ...req.body, image });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service updated successfully',
    data: response,
  });
});

const deleteService = catchAsync(async (req, res) => {
  const response = await ServiceService.delete(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service deleted successfully',
    data: response,
  });
});

const updateServiceStatus = catchAsync(async (req, res) => {
  let status = req.body.status;
  if (typeof status === 'string') {
    status = status === 'true' || status === '1';
  }
  const response = await ServiceService.updateStatus(req.params.id, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service status updated successfully',
    data: response,
  });
});

export const ServiceController = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  updateServiceStatus,
};
