'use server';

import axiosInterceptorInstance from '@/lib/api';

export const sendImage = async (
  conversationId: string,
  formData?: FormData
) => {
  if (formData != null) {
    const result = await axiosInterceptorInstance
      .postForm(
        `${process.env.API_SERVER_URL}/api/v1/chat/messages/pics?conversationId=${conversationId}`,
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
