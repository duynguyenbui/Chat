import { ChatLayout } from '@/components/chats/chat-layout';
import React, { PropsWithChildren } from 'react';

const ConversationLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="flex h-[calc(88dvh)] flex-col items-center justify-center p-0 md:px-7 mt-3 gap-4">
      <div className="z-10 border rounded-lg max-w-full w-full h-full text-sm lg:flex">
        <ChatLayout>{children}</ChatLayout>
      </div>
    </main>
  );
};

export default ConversationLayout;
