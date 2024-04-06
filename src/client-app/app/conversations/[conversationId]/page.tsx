import { getConversationById } from '@/actions/conversations';
import { auth } from '@/auth';
import ChatBody from '@/components/chats/chat-body';
import { ChatTopbar } from '@/components/chats/chat-topbar';
import React from 'react';

export const revalidate = 0;

const ConversationIdPage = async ({
  params,
}: {
  params: { conversationId: string };
}) => {
  const session = await auth();
  const conversation = await getConversationById(params.conversationId);

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopbar conversation={conversation} />
      <ChatBody
        conversationId={conversation?.conversationId || ''}
        messages={conversation?.messages}
        selectedUser={conversation.users.find(
          (user) => user.name === session?.user.name
        )}
      />
    </div>
  );
};

export default ConversationIdPage;
