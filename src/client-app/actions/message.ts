'use server';

import axiosInterceptorInstance from '@/lib/api';

export const message = async (
  message: {
    conversationId: string;
    content?: string;
  },
  connectionId?: string | null
) => {
  const data = await axiosInterceptorInstance
    .post(
      `${process.env.API_SERVER_URL}/api/v1/chat/messages`,
      {
        conversationId: message.conversationId,
        content: message.content,
      },
      {
        headers: {
          'x-connectionid': connectionId,
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => console.error(err.message));

  return data;
};
