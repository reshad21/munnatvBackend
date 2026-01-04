import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ContactService } from './contact.service';


const createContact = catchAsync(async (req, res) => {
  const response = await ContactService.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Contact created successfully',
    data: response,
  });
});

const getAllContacts = catchAsync(async (req, res) => {
  const response = await ContactService.getAll(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Contacts retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getContactById = catchAsync(async (req, res) => {
  const response = await ContactService.getById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Contact retrieved successfully',
    data: response,
  });
});

const deleteContact = catchAsync(async (req, res) => {
  const response = await ContactService.delete(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Contact deleted successfully',
    data: response,
  });
});

export const ContactController = {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
};
