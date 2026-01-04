import catchAsync from '../../utils/catchAsync';
import { getSingleImageUrl } from '../../utils/getImageUrl';
import sendResponse from '../../utils/sendResponse';
import { FivePillarService } from './fivepillar.service';

const createFivePillar = catchAsync(async (req, res) => {
	const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
	const response = await FivePillarService.create({
		...req.body,
		image,
	});
	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: 'Five Pillar created successfully',
		data: response,
	});
});

const getAllFivePillars = catchAsync(async (req, res) => {
	const response = await FivePillarService.getAll(req.query);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: 'Five Pillars retrieved successfully',
		data: response,
	});
});


const getFivePillarById = catchAsync(async (req, res) => {
	const response = await FivePillarService.getById(req.params.id);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: 'Five Pillar retrieved successfully',
		data: response,
	});
});


const updateFivePillar = catchAsync(async (req, res) => {
	const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
	const response = await FivePillarService.update(req.params.id, {
		...req.body,
		image,
	});
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: 'Five Pillar updated successfully',
		data: response,
	});
});


const deleteFivePillar = catchAsync(async (req, res) => {
	const response = await FivePillarService.delete(req.params.id);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: 'Five Pillar deleted successfully',
		data: response,
	});
});


const updateFivePillarStatus = catchAsync(async (req, res) => {
	const { id } = req.params;
	// Accept status from form-data or body
	let status = req.body.status;
	if (typeof status === 'string') {
		status = status === 'true' || status === '1';
	}
	const response = await FivePillarService.updateStatus(id, status);
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: 'Five Pillar status updated successfully',
		data: response,
	});
});

export const FivePillarController = {
	createFivePillar,
	getAllFivePillars,
	getFivePillarById,
	updateFivePillar,
	deleteFivePillar,
	updateFivePillarStatus,
};
