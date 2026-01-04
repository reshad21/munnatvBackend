// ContactUs Controller
import { ContactUsService } from './contact-us.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getImageUrl';

export class ContactUsController {
  static createContactUs = catchAsync(async (req: Request, res: Response) => {
    const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
    const contactUs = await ContactUsService.create({
      ...req.body,
      image,
    });
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: contactUs && contactUs.id ? 'ContactUs created/updated successfully' : 'ContactUs created successfully',
      data: contactUs,
    });
  });

  static getAllContactUs = catchAsync(async (req: Request, res: Response) => {
    const contactUsList = await ContactUsService.getAll(req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'ContactUs list fetched successfully',
      data: contactUsList,
    });
  });

  static getContactUsById = catchAsync(async (req: Request, res: Response) => {
    const contactUs = await ContactUsService.getById(req.params.id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'ContactUs fetched successfully',
      data: contactUs,
    });
  });

  static updateContactUs = catchAsync(async (req: Request, res: Response) => {
    const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
    const contactUs = await ContactUsService.update(req.params.id, {
      ...req.body,
      image,
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'ContactUs updated successfully',
      data: contactUs,
    });
  });

  static deleteContactUs = catchAsync(async (req: Request, res: Response) => {
    await ContactUsService.delete(req.params.id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'ContactUs deleted successfully',
      data: null,
    });
  });
}
