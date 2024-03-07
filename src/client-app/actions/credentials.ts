'use server';

import { LoginSchema } from '@/schemas';
import { TokenResponse, User } from '@/types';
import { z } from 'zod';

export const credential = async (values: Partial<Record<string, unknown>>) => {
  const validatedFields = LoginSchema.safeParse(
    values as z.infer<typeof LoginSchema>
  );

  if (validatedFields.success) {
    const authResponse = await fetch(
      `${
        process.env.API_SERVER_URL ?? 'http://localhost:5000'
      }/api/v1/identity/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      }
    );

    if (!authResponse.ok) {
      return null;
    }

    const token: TokenResponse = await authResponse.json();

    const userResponse: User = await fetch(
      `${
        process.env.API_SERVER_URL ?? 'http://localhost:5000'
      }/api/v1/identity/manage/info`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      }
    ).then((res) => res.json());

    const user = { ...token, ...userResponse };

    return user;
  }

  return null;
};
