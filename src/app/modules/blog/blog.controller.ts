import catchAsync from '../../utils/catchAsync';
import { getSingleImageUrl } from '../../utils/getImageUrl';
import sendResponse from '../../utils/sendResponse';
import { BlogService } from './blog.service';

const createBlog = catchAsync(async (req, res) => {
  const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
  const response = await BlogService.create({ ...req.body, image });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Blog created successfully',
    data: response,
  });
});

const getAllBlogs = catchAsync(async (req, res) => {
  const response = await BlogService.getAll(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blogs retrieved successfully',
    data: response,
  });
});

const getBlogById = catchAsync(async (req, res) => {
  const response = await BlogService.getById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blog retrieved successfully',
    data: response,
  });
});

const updateBlog = catchAsync(async (req, res) => {
  const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
  const response = await BlogService.update(req.params.id, { ...req.body, image });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blog updated successfully',
    data: response,
  });
});

const deleteBlog = catchAsync(async (req, res) => {
  const response = await BlogService.delete(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blog deleted successfully',
    data: response,
  });
});

const updateBlogStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  // const image = req.file ? getSingleImageUrl(req, req.file) : undefined;
  let status = req.body.status;
  if (typeof status === 'string') {
    status = status === 'true' || status === '1';
  }
  const response = await BlogService.updateStatus(id, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Blog status updated successfully',
    data: response,
  });
});

export const BlogController = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
};
