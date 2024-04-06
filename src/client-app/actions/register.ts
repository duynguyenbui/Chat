'use server';

import { RegisterSchema } from '@/schemas';
import { z } from 'zod';
import axios from 'axios';

export const register = async (data: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password, confirmedPassword } = validatedFields.data;

  if (password !== confirmedPassword) {
    return { error: 'Confirmed password is not matched' };
  }

  try {
    const res = await axios
      .post(`${process.env.API_SERVER_URL}/api/v1/identity/register`, {
        email,
        password,
      })
      .then((res) => res.data);
  } catch (error) {
    console.error('REGISTER_ERROR:::', error);
  }

  return { success: 'Register Successfully' };
};
