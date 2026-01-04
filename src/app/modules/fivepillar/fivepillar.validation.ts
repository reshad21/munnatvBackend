import { z } from 'zod';

const createFivePillarValidation = z.object({
	body: z.object({
		image: z.string().optional(),
		title: z.string({ required_error: 'Title is required' }),
		description: z.string({ required_error: 'Description is required' }),
		order: z.string({ required_error: 'Order is required' }),
		status: z.string({ required_error: 'Status is required' }),
	}),
});

const updateFivePillarValidation = z.object({
	body: z.object({
		image: z.string().optional(),
		title: z.string().optional(),
		description: z.string().optional(),
		order: z.string().optional(),
		status: z.string().optional(),
	}),
});

export const FivePillarValidation = {
	createFivePillarValidation,
	updateFivePillarValidation,
};
