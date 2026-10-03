import { Router } from "express";
import auth from "../../middlewares/authorization";
import { imageUpload, uploadImages } from "../../middlewares/multer";
import validation from "../../middlewares/validation";
import { BlogController } from "./blog.controller";
import { BlogValidation } from "./blog.validation";
import { featureNames } from "../../constant/seedRoleData";
import { can } from "../../constant/permissions";

const router = Router();

router.post(
  '/',
  auth([can(featureNames.blogs, 'create')]),
  imageUpload.single('image'),
  validation(BlogValidation.createBlogValidation),
  uploadImages,
  BlogController.createBlog,
);

router.get('/', BlogController.getAllBlogs);

router.patch(
  '/:id/status',
  auth([can(featureNames.blogs, 'status')]),
  BlogController.updateBlogStatus,
);

router.get('/:id', BlogController.getBlogById);

router.put(
  '/:id',
  auth([can(featureNames.blogs, 'edit')]),
  imageUpload.single('image'),
  validation(BlogValidation.updateBlogValidation),
  uploadImages,
  BlogController.updateBlog,
);

router.delete(
  '/:id',
  auth([can(featureNames.blogs, 'delete')]),
  BlogController.deleteBlog,
);

export const BlogRoutes = router;