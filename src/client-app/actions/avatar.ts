'use server';

import axiosInterceptorInstance from '@/lib/api';

export const changeAvatar = async (formData?: FormData) => {
    
  if (formData != null) {
    const result = await axiosInterceptorInstance
      .postForm(
        `${process.env.API_SERVER_URL}/api/v1/identity/users/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      .then((res) => res.data)
      .catch((err) => console.error(err.message));

    return result;
  }

  return null;
};
