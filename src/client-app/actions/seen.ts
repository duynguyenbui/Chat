'use server';

import axiosInterceptorInstance from '@/lib/api';

export const seen = async (
  conversationId: string,
  connectionId?: string | null
) => {
  const data = await axiosInterceptorInstance
    .post(
      `${process.env.API_SERVER_URL}/api/v1/chat/conversations/${conversationId}/seen`,
      null, // pass null as the second argument if you don't need to send data in the request body
      {
        headers: {
          'x-connectionid': connectionId,
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => console.error(err));

  if (data) {
    return { success: data };
  }

  return {
    error: `Seen conversation ${conversationId} failed`,
  };
};
