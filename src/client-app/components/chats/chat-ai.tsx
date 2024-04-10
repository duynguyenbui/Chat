'use client';

import React, { useEffect, useRef, useState } from 'react';
import ChatBottombar from './chat-bottombar';
import { Message, User } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { generateAIMessage } from '@/lib/message-utils';
import { message } from '@/actions/message';
import { ChatTopbar } from './chat-topbar';

const ChatAI = ({ user }: { user: User }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiMessage, setAiMessage] = useState('');

  const handleMessage = (message: Message) => {
    handleStream(message.content);
    setMessages((prev) => [...prev, message]);
  };

  useEffect(() => {
    if (messages) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }
  }, [messages, aiMessage]);

  const handleStream = (query: string) => {
    // Fetch the event stream from the server
    // Change URL to environment variable for production
    fetch(`http://localhost:5000/api/v1/chat/messages/ai/stream?input=${query}`)
      .then((response) => {
        // Get the readable stream from the response body

        const stream = response.body;
        // Get the reader from the stream
        const reader = stream?.getReader();

        if (reader != null) {
          // Define a function to read each chunk
          const readChunk = () => {
            // Read a chunk from the reader
            reader
              .read()
              .then(({ value, done }) => {
                // Check if the stream is done
                if (done) {
                  return;
                }
                // Convert the chunk value to a string
                const chunkString = new TextDecoder().decode(value);

                setAiMessage((prev) => prev.concat(chunkString));

                // Read the next chunk
                readChunk();
              })
              .catch((error) => {
                // Log the error
                console.error(error);
              });
          };
          // Start reading the first chunk
          readChunk();
        }
      })
      .catch((error) => {
        // Log the error
        console.error(error);
      })
      .finally(() => setAiMessage(''));
  };

  return (
    <>
      <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
        <div
          className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
          ref={messagesContainerRef}
        >
          <div className="w-full h-20 flex p-4 justify-between items-center border-b text-muted-foreground font-bold">
            AI Conversation
          </div>
          <AnimatePresence>
            {messages.map((message, index) => (
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
                  message.sender.email != 'ai@email.com'
                    ? 'items-end'
                    : 'items-start'
                )}
              >
                <div className="flex gap-3 items-center">
                  <span className="bg-accent p-3 rounded-md max-w-xs">
                    <div className="flex flex-col items-start gap-2">
                      {message.content != '' && message.content}
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
                    <AvatarFallback>
                      {user.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </motion.div>
            ))}

            {aiMessage != '' && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                transition={{
                  opacity: { duration: 0.1 },
                  layout: {
                    type: 'spring',
                    bounce: 0.3,
                  },
                }}
                style={{
                  originX: 0.5,
                  originY: 0.5,
                }}
                className={cn(
                  'flex flex-col gap-2 p-4 whitespace-pre-wrap',
                  'items-start'
                )}
              >
                <div className="flex gap-3 items-center">
                  <Avatar className="flex justify-center items-center">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <span className="bg-accent p-3 rounded-md max-w-xs">
                    <div className="flex flex-col items-start gap-2">
                      {aiMessage != '' && aiMessage}
                    </div>
                  </span>
                </div>
              </motion.div>
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
    </>
  );
};

export default ChatAI;
