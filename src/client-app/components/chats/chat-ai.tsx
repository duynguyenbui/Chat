'use client';

import React, { useEffect, useRef, useState } from 'react';
import ChatBottombar from './chat-bottombar';
import { Message, User } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { StarsIcon } from 'lucide-react';
import { getUrlEnvironment } from '@/lib/get-environment';

const apiUrl = getUrlEnvironment();

const ChatAI = ({ user }: { user: User }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiMessage, setAiMessage] = useState('');

  const handleMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
    handleStream(message.content);
  };

  const handleStream = (query: string) => {
    // Fetch the event stream from the server
    // Change URL to environment variable for production
    fetch(`${apiUrl}/api/v1/chat/messages/ai/stream?input=${query}`)
      .then((response) => {
        // Get the readable stream from the response body

        const stream = response.body;
        // Get the reader from the stream
        const reader = stream?.getReader();

        if (reader != null) {
          const readChunk = () => {
            reader
              .read()
              .then(({ value, done }) => {
                if (done) {
                  return;
                }
                const chunkString = new TextDecoder().decode(value);
                setAiMessage((prev) => prev.concat(chunkString));
                readChunk();
              })
              .catch((error) => {
                console.error(error);
              });
          };
          readChunk();
        }
      })
      .catch((error) => console.error(error))
      .finally(() => setAiMessage(''));
  };

  console.log({ aiMessage });

  useEffect(() => {
    if (messages) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }
  }, [messages, aiMessage]);

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
                {message.sender.name === user.name && (
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
                        alt={message.sender.name ?? ''}
                      />
                      <AvatarFallback>
                        {message.sender.name.at(0)?.toUpperCase() || 'ME'}
                      </AvatarFallback>
                    </Avatar>
                  </>
                )}
              </div>
            </motion.div>
          ))}

          {aiMessage !== '' && (
            <div className="flex gap-3 items-center p-4 whitespace-pre-wrap">
              <Avatar className="flex justify-center items-center">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <span className="bg-accent p-3 rounded-md max-w-xs">
                <div className="flex flex-col items-start gap-2">
                  <div>{aiMessage !== '' && aiMessage}</div>
                </div>
              </span>
            </div>
          )}
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
