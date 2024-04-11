import * as z from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(6, {
    message: 'Minimum 6 characters required',
  }),
  confirmedPassword: z.string().min(1, {
    message: 'Confirmed password is required',
  }),
});

export const SettingsSchema = z
  .object({
    email: z.optional(z.string().email()),
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
  })
  .refine(
    (data) => {
      if (data.oldPassword && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: 'New password is required!',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.oldPassword) {
        return false;
      }

      return true;
    },
    {
      message: 'Password is required!',
      path: ['password'],
    }
  );

export const CreateConversationSchema = z.object({
  name: z.optional(z.string()),
  userId: z.optional(z.string()),
  members: z.optional(z.string().array()),
  isGroup: z.optional(z.boolean()),
});