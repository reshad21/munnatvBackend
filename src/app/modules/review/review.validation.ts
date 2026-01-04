import z from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    name: z.string(),
    designation: z.string(),
    rating: z.string().refine((val) => {
      const num = Number(val);
      return Number.isInteger(num) && num >= 1 && num <= 5;
    }),
    description: z.string(),
    image: z.string().optional(),
    status: z.string({ required_error: 'Status is required' }),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    designation: z.string().optional(),
    rating: z.string().refine((val) => {
      const num = Number(val);
      return Number.isInteger(num) && num >= 1 && num <= 5;
    }).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    status: z.string().optional(),
  }),
});
