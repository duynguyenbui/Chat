'use server';

import { auth, signOut } from '@/auth';
import axiosInterceptorInstance from '@/lib/api';
import { SettingsSchema } from '@/schemas';
import * as z from 'zod';

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const session = await auth();

  if (session?.user) {
    const validatedFields = SettingsSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: 'Missing credentials' };
    }

    const { email, oldPassword, newPassword } = values;

    // TODO: Change credentials to the server
    const response = await axiosInterceptorInstance.post(
      `${process.env.API_SERVER_URL}/api/v1/identity/manage/info`,
      {
        newEmail: email,
        newPassword,
        oldPassword,
      }
    );

    if (response.status === 200) {
      await signOut();
      return { success: 'Change user information successfully' };
    }

    return { error: 'Something went wrong' };
  }

  return { error: 'Missing credentials' };
};
