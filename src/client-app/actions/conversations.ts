'use server';

import axiosInterceptorInstance from '@/lib/api';
import { CreateConversationSchema } from '@/schemas';
import { Conversation } from '@/types';
import { z } from 'zod';

export const getConversationById = async (conversationId: string) => {
  const conversation: Conversation = await axiosInterceptorInstance
    .get(
      `${process.env
        .API_SERVER_URL!}/api/v1/chat/conversations/${conversationId}`
    )
    .then((res) => res.data)
    .catch((err) => console.error(err.message));

  return conversation;
};

export const getConversationByUserId = async (userId?: string) => {
  if (!userId) return [];

  const conversations: Conversation[] = await axiosInterceptorInstance
    .get(
      `${process.env
        .API_SERVER_URL!}/api/v1/chat/conversations/by/user/${userId}`
    )
    .then((res) => res.data)
    .catch((err) => console.error('GetConversationByUserId:::', err));

  return conversations;
};

export const deleteConversation = async (conversationId?: string) => {
  if (!conversationId) throw new Error();

  var res = await axiosInterceptorInstance
    .delete(
      `${process.env
        .API_SERVER_URL!}/api/v1/chat/conversations/${conversationId}`
    )
    .then((res) => res.status)
    .catch((err) => console.error(err.message));

  if (res === 204) {
    return {
      success: `Delete conversation with ${conversationId} successfully`,
    };
  }

  return { error: 'Something went wrong' };
};

export const createConversation = async (
  values: z.infer<typeof CreateConversationSchema>
) => {
  const validatedFields = CreateConversationSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { name, isGroup, userId, members } = validatedFields.data;

  if (!isGroup) {
    if (!userId) return { error: 'Missing user pair!' };

    const res = await axiosInterceptorInstance
      .post(`${process.env.API_SERVER_URL!}/api/v1/chat/conversations`, {
        userId: userId,
        isGroup: false,
      })
      .then((res) => res.data)
      .catch((err) => {
        console.error(err.message);
        return { error: 'Something went wrong' };
      });

    return {
      success: 'Create single conversation successfully',
    };
  }

  if (!members || members.length < 2 || !name) {
    return { error: 'Missing value!' };
  }

  axiosInterceptorInstance
    .post(`${process.env.API_SERVER_URL!}/api/v1/chat/conversations`, {
      isGroup: true,
      name: name,
      members: members,
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error(err.message);
      return { error: 'Something went wrong' };
    });

  return { success: 'Create group conversation successfully' };
};
