'use client';

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Message, User } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar } from '../ui/avatar';
import { AvatarFallback } from '../ui/avatar';
import ChatBottomBar from './chat-bottombar';
import { EmptyState } from './empty-state';
import { seen } from '@/actions/seen';
import { message } from '@/actions/message';
import Image from 'next/image';
import { useModal } from '@/hooks/use-store-modal';

interface ChatBodyProps {
  messages?: Message[];
  selectedUser?: User;
  conversationId: string;
}

const ChatBody = ({
  messages = [],
  selectedUser,
  conversationId,
}: ChatBodyProps) => {
  const { onOpen } = useModal();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [messagesState, setMessagesState] = useState(messages || []);

  /**
   * SignalR connection
   */
  useEffect(() => {
    const HubConnection = new HubConnectionBuilder()
      .withUrl(
        `${process.env.NEXT_PUBLIC_NOTIFY_SERVER_URL}` ||
          'http://localhost:5000/api/v1/notify'
      )
      .withAutomaticReconnect()
      .build();

    setConnection(HubConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      if (connection.state !== HubConnectionState.Connected) {
        connection
          .start()
          .then(() => {
            console.log(
              `Connected to ${
                process.env.NEXT_PUBLIC_NOTIFY_SERVER_URL ||
                'http://localhost:5000/api/v1/notify'
              } with connection ID:::`,
              connection.connectionId
            );
            seen(conversationId, connection.connectionId);

            connection.send('AddToGroup', conversationId);

            connection.on('join_group', (data) => console.log(data));
            connection.on('leave_group', (data) => console.log(data));

            connection.on('message_created', (data) =>
              setMessagesState((prev) => [...prev, data])
            );
          })
          .catch((err) => console.error(err.message));
      }
    }

    return () => {
      connection?.stop();
    };
  }, [connection]);

  const sendMessage = (newMessage: Message) => {
    // console.log(connection?.connectionId);
    if (connection && connection.connectionId) {
      message(
        { conversationId: conversationId, content: newMessage.content },
        connection.connectionId
      );
    } else {
      console.error('Connection ID is not available.');
    }
    setMessagesState([...messagesState, newMessage]);
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesState) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }
  }, [messagesState]);

  if (!selectedUser) {
    return <EmptyState content="Select a chat or start a new conversation" />;
  }

  return (
    <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
      <div
        ref={messagesContainerRef}
        className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
      >
        {/* {JSON.stringify(connection?.connectionId)} */}
        <AnimatePresence>
          {messagesState?.map((message, index) => (
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
                  duration: messagesState.indexOf(message) * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              className={cn(
                'flex flex-col gap-2 p-4 whitespace-pre-wrap',
                message.sender.name !== selectedUser?.name
                  ? 'items-start'
                  : 'items-end'
              )}
            >
              <div className="flex gap-3 items-center">
                {message.sender.name !== selectedUser?.name && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarFallback>
                      {message.sender.name.at(0)?.toUpperCase() || 'YO'}
                    </AvatarFallback>
                  </Avatar>
                )}

                <span className="bg-accent p-3 rounded-md max-w-xs">
                  <div className="flex flex-col items-start gap-2">
                    <div>
                      {message.content !== '' && message.content}
                      {message.imageFileName !== '' && (
                        <Image
                          onClick={() =>
                            onOpen('showImage', {
                              messageId: message.messageId,
                            })
                          }
                          height={300}
                          width={300}
                          src={`http://localhost:5000/api/v1/chat/messages/${message.messageId}/pic`}
                          alt={message.messageId}
                          unoptimized={true}
                        />
                      )}
                    </div>
                    <div>
                      {messagesState.length - 1 === index && (
                        <h5 className="text-xs text-muted-foreground ">
                          <time suppressHydrationWarning>
                            {new Date(message.createdAt).toLocaleTimeString() ||
                              '00:00 AM'}
                          </time>
                        </h5>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground text-end">
                    {message.seen.filter(
                      (user) => user.name != selectedUser.name
                    ).length !== 0 && (
                      <>
                        {message.seen
                          .filter(
                            (user) =>
                              user.name != selectedUser.name &&
                              message.sender.name === selectedUser.name
                          )
                          .map((user) => user.name)}
                      </>
                    )}
                  </span>
                </span>
                {message.sender.name === selectedUser?.name && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarFallback>
                      {message.sender.name.at(0)?.toUpperCase() || 'ME'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <ChatBottomBar
        conversationId={conversationId}
        isMobile={false}
        sendMessage={sendMessage}
        loggedInUserData={selectedUser}
      />
    </div>
  );
};

export default ChatBody;
