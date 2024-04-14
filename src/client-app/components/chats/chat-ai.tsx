'use client';

import React, { useEffect, useRef, useState } from 'react';
import ChatBottombar from './chat-bottombar';
import { HistoryItem, Message, User } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { StarsIcon } from 'lucide-react';
import { sendAiMessage } from '@/actions/ai-message';
import { generateAIMessage } from '@/lib/message-utils';

const ChatAI = ({ user }: { user: User }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);

    var historyItems = getHistoryItemsFromMessages(messages, user);

    onSubmit({ text: message.content, historyItems: historyItems });
  };

  const onSubmit = async ({
    text,
    historyItems = [],
  }: {
    text: string;
    historyItems?: HistoryItem[];
  }) => {
    try {
      var result = await sendAiMessage(text, historyItems);
      setMessages((prev) => [...prev, generateAIMessage(result)]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (messages) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
      <div
        className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
        ref={messagesContainerRef}
      >
        <div className="w-full h-20 flex p-4 justify-start items-center border-b text-muted-foreground font-bold">
          <StarsIcon className="mr-2" />
          AI Conversation
        </div>
        <AnimatePresence>
          {messages?.map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: 'spring',
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              className={cn(
                'flex flex-col gap-2 p-4 whitespace-pre-wrap',
                message.sender.name !== user?.name ? 'items-start' : 'items-end'
              )}
            >
              <div className="flex gap-3 items-center">
                {message.sender.name === user.name ? (
                  <>
                    <span className="bg-accent p-3 rounded-md max-w-xs">
                      <div className="flex flex-col items-start gap-2">
                        <div>{message.content !== '' && message.content}</div>
                        <div>
                          {messages.length - 1 === index && (
                            <h5 className="text-xs text-muted-foreground ">
                              <time suppressHydrationWarning>
                                {new Date(
                                  message.createdAt
                                ).toLocaleTimeString() || '00:00 AM'}
                              </time>
                            </h5>
                          )}
                        </div>
                      </div>
                    </span>
                    <Avatar className="flex justify-center items-center">
                      <AvatarImage
                        src={message.sender.image}
                        alt={message.sender.image ?? ''}
                      />
                      <AvatarFallback>
                        {message.sender.name.at(0)?.toUpperCase() || 'ME'}
                      </AvatarFallback>
                    </Avatar>
                  </>
                ) : (
                  <>
                    <Avatar className="flex justify-center items-center">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <span className="bg-accent p-3 rounded-md max-w-xs">
                      <div className="flex flex-col items-start gap-2">
                        <div>{message.content !== '' && message.content}</div>
                        <div>
                          {messages.length - 1 === index && (
                            <h5 className="text-xs text-muted-foreground ">
                              <time suppressHydrationWarning>
                                {new Date(
                                  message.createdAt
                                ).toLocaleTimeString() || '00:00 AM'}
                              </time>
                            </h5>
                          )}
                        </div>
                      </div>
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <ChatBottombar
        sendMessage={handleMessage}
        isMobile={false}
        loggedInUserData={user}
        isAIConversation
      />
    </div>
  );
};

export default ChatAI;

const getHistoryItemsFromMessages = (
  messages: Message[],
  user: User
): HistoryItem[] => {
  // Lọc ra các tin nhắn của người dùng
  const userMessages = messages.filter(
    (message) => message.sender.name === user.name
  );

  // Tạo mảng các mục lịch sử từ các tin nhắn của người dùng
  const historyItems = userMessages.map((message) => ({
    role: 'user', // Đây là người dùng
    content: message.content,
  }));

  return historyItems;
};
