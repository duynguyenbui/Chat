'use server';

import axiosInterceptorInstance from '@/lib/api';
import { Message } from '@/types';

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

export const findMessage = async (
  conversationId: string,
  contentToFind: string
) => {
  if (contentToFind === '' || !conversationId) return [] as Message[];

  var res = await axiosInterceptorInstance
    .get(
      `${process.env.API_SERVER_URL}/api/v1/chat/conversations/find/messages/${conversationId}?contentToFind=${contentToFind}`
    )
    .then((res) => {
      if (res.status !== 200) {
        return [] as Message[];
      }

      return res.data as Message[];
    })
    .catch((err) => {
      console.error(err.message);
      return [] as Message[];
    });

  return res;
};
