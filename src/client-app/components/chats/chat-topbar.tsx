'use client';

import React, { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Search, TimerIcon, TrashIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import { useModal } from '@/hooks/use-store-modal';
import { Conversation } from '@/types';
import { EmptyState } from './empty-state';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Input } from '../ui/input';
import { CommandSearch } from './command-search-menu';

interface ChatTopbarProps {
  conversation: Conversation | null;
}

export const ChatTopbar = ({ conversation }: ChatTopbarProps) => {
  const { onOpen } = useModal();
  const user = useCurrentUser();

  if (!conversation) {
    return <EmptyState />;
  }

  return (
    <div className="w-full h-20 flex p-4 justify-between items-center border-b">
      <div className="flex items-center gap-10">
        <div className="flex gap-3">
          <Avatar className="flex justify-center items-center">
            <AvatarFallback>
              {conversation.name !== null
                ? conversation.name
                : conversation.users[0].email.charAt(0).toUpperCase() || 'DN'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start justify-center">
            <div className="flex">
              <div>
                <div className="flex space-x-2 items-center">
                  <h2 className="font-bold text-muted-foreground">
                    {conversation.name !== null
                      ? conversation.name
                      : conversation.users.find((u) => u.name !== user?.name)
                          ?.name || 'DN'}
                  </h2>
                  <div className="flex space-x-1">
                    <TimerIcon className="h-4 w-4" />
                    <h3 className="text-xs text-gray-400 mt-[1px]">
                      <time suppressHydrationWarning>
                        {new Date(conversation.lastMessageAt).toLocaleString()}
                      </time>
                    </h3>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {conversation.conversationId}
                </span>
              </div>

              <div className="ml-2 mt-2">
                {conversation.isGroup && <Users />}
              </div>
            </div>
          </div>
        </div>
        <div className="ml-2 flex items-center gap-2 p-2 rounded-md">
          <Search className="w-4 h-4" />
          <CommandSearch conversationId={conversation.conversationId} />
        </div>
      </div>

      <div>
        <div
          onClick={() => onOpen('deleteConversation', { conversation })}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'h-9 w-9',
            'dark:bg-muted mr-2 dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
          )}
        >
          <TrashIcon size={20} className="text-red-600" />
        </div>
      </div>
    </div>
  );
};
