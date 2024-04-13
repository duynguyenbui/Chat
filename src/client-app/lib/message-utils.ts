import { Message, User } from '@/types';

export function generateMessage(message: string, user: User) {
  const newMessage: Message = {
    messageId: crypto.randomUUID(),
    content: message,
    imageFileName: '',
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    sender: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    seen: [
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    ],
  };
  return newMessage;
}

export function generateAIMessage(message: string) {
  const newMessage: Message = {
    messageId: crypto.randomUUID(),
    content: message,
    imageFileName: '',
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    sender: {
      id: 'b91a9cb7-fa92-4683-b5bd-51e7fd20eace',
      name: 'ai',
      email: 'ai@email.com',
    },
    seen: [
      {
        id: 'b91a9cb7-fa92-4683-b5bd-51e7fd20eace',
        name: 'ai',
        email: 'ai@email.com',
      },
    ],
  };
  return newMessage;
}
