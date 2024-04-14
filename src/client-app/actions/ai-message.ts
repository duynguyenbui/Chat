'use server';

import axiosInterceptorInstance from '@/lib/api';
import { HistoryItem } from '@/types';

export const sendAiMessage = async (
  message: string,
  historyItems?: HistoryItem[]
) => {
  var res = axiosInterceptorInstance
    .post(`${process.env.API_SERVER_URL!}/api/v1/chat/messages/ai`, {
      text: message,
      historyItems: historyItems,
    })
    .then((res) => {
      if (res.status !== 200) {
        return 'Something went wrong!';
      }

      return res.data;
    })
    .catch((err) => {
      console.error(err);
      return 'Something went wrong!';
    });

  return res as Promise<string>;
};
