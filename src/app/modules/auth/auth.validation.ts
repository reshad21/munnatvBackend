import { z } from 'zod';

const loginValidation = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
  }),
});

const registerValidation = z.object({
  body: z.object({
    fullName: z.string({ required_error: 'Full name is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters long'),
    roleId: z.string({ required_error: 'Role ID is required' }),
  }),
});

const changePasswordValidation = z.object({
  body: z.object({
    currentPassword: z
      .string({ required_error: 'Current password is required' })
      .min(6, 'Current password must be at least 6 characters long'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'New password must be at least 6 characters long'),
  }),
});

const updateAdminUserValidation = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full name is required').optional(),
    email: z.string().email('Invalid email format').optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .optional(),
    roleId: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const authValidations = {
  loginValidation,
  registerValidation,
  changePasswordValidation,
  updateAdminUserValidation,
};
