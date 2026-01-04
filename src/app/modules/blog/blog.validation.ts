import { z } from 'zod';


const createBlogValidation = z.object({
  body: z.object({
    author: z.string(),
    title: z.string(),
    shortDescription: z.string(),
    description: z.string(),
    image: z.string().optional(),
    status: z.string().optional(),
  }),
});

const updateBlogValidation = z.object({
  body: z.object({
    author: z.string().optional(),
    title: z.string().optional(),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    status: z.string().optional(),
  }),
});

export const BlogValidation = {
  createBlogValidation,
  updateBlogValidation,
};
