'use server';

import { auth } from '@/auth';
import axiosInterceptorInstance from '@/lib/api';
import { User } from '@/types';

export const getUsers = async () => {
  const session = await auth();

  if (session?.user) {
    const users: User[] = await axiosInterceptorInstance
      .get(`${process.env.API_SERVER_URL}/api/v1/identity/users/all`)
      .then((res) => res.data)
      .catch((err) => console.error(err));

    if (users) {
      return users;
    }
  }

  return [];
};
