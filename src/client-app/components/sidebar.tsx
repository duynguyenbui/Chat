'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SquarePen, StarsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from './ui/avatar';
import { getConversationByUserId } from '@/actions/conversations';
import { useCurrentUser } from '@/hooks/use-current-user';

import { useModal } from '@/hooks/use-store-modal';
import { Conversation } from '@/types';

interface SidebarProps {
  isCollapsed: boolean;
  onClick?: () => void;
  isMobile: boolean;
}

export function Sidebar({ isCollapsed, isMobile }: SidebarProps) {
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const { onOpen } = useModal();

  const { data: conversations } = useSWR(
    [currentUser?.id],
    ([userId]) => getConversationByUserId(userId),
    {
      refreshInterval: 2000,
    }
  );

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative group flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2 "
    >
      {!isCollapsed ? (
        <div className="flex justify-between p-2 items-center">
          <div className="flex gap-2 items-center text-2xl">
            <p className="font-medium">Chats</p>
            <span className="text-zinc-300">
              ({conversations?.length || 0})
            </span>
          </div>

          <div>
            <Link
              href="#"
              onClick={() => onOpen('createConversation')}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'h-9 w-9'
              )}
            >
              <SquarePen size={20} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-2xl transition-all ml-1">
          <span className="text-zinc-300">({conversations?.length || 0})</span>
        </div>
      )}
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {isCollapsed || isMobile ? (
          <Link href="/conversations/ai" className="md:ml-3 sm:ml-1">
            <Avatar className="flex justify-center items-center">
              <AvatarFallback className="w-10 h-10">AI</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Link
            href="/conversations/ai"
            className="ml-5 flex max-w-full items-center gap-4 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 text-transparent bg-clip-text"
          >
            <Avatar className="flex justify-center items-center">
              <AvatarFallback className="w-10 h-10">AI</AvatarFallback>
            </Avatar>
            <div className="flex">
              <span className="bg-gradient-to-tl">Chat With AI</span>
              <StarsIcon className="w-5 h-5 ml-3 bg-gradient-to-r from-cyan-500 to-blue-500" />
            </div>
          </Link>
        )}

        {conversations?.map((conversation, index) =>
          isCollapsed || isMobile ? (
            <TooltipProvider key={index}>
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={`/conversations/${conversation.conversationId}`}
                    className={cn(
                      buttonVariants({
                        variant: pathname.includes(conversation.conversationId)
                          ? 'grey'
                          : 'ghost',
                        size: 'icon',
                      }),
                      'h-11 w-11 md:h-16 md:w-16',
                      pathname.includes(conversation.conversationId) &&
                        'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
                    )}
                  >
                    <Avatar className="flex justify-center items-center">
                      <AvatarFallback className="w-10 h-10">
                        {(conversation?.name === null &&
                          conversation.users
                            .find((user) => user?.name !== currentUser?.email)
                            ?.name.charAt(0)
                            .toUpperCase()) ||
                          'N'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">{conversation.name}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {conversation.name ||
                    conversation.users
                      .filter((user) => user.name !== currentUser?.name)
                      .map((user) => user.name)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Link
              key={index}
              href={`/conversations/${conversation.conversationId}`}
              className={cn(
                buttonVariants({
                  variant: pathname.includes(conversation.conversationId)
                    ? 'grey'
                    : 'ghost',
                  size: 'xl',
                }),
                pathname.includes(conversation.conversationId) &&
                  'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink',
                'justify-start gap-4'
              )}
            >
              <Avatar className="flex justify-center items-center">
                <AvatarFallback className="w-10 h-10">
                  {(conversation?.name === null &&
                    conversation.users
                      .find((user) => user?.name !== currentUser?.email)
                      ?.name.charAt(0)
                      .toUpperCase()) ||
                    'N'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col max-w-28">
                <span className="flex gap-2 items-center">
                  {conversation?.name === null &&
                    conversation.users.find(
                      (user) => user?.name !== currentUser?.email
                    )?.name}
                  {conversation.name}
                  <time
                    suppressHydrationWarning
                    className="text-xs text-muted-foreground"
                  >
                    {new Date(conversation.lastMessageAt).toLocaleTimeString()}
                  </time>
                </span>
                {conversation.messages.length > 0 && (
                  <span
                    className={cn(
                      'text-zinc-300 text-xs truncate',
                      !userSeenConversation(conversation, currentUser?.id) &&
                        'font-bold text-black dark:text-white dark:hover:bg-muted dark:hover:text-white shrink'
                    )}
                  >
                    {
                      conversation.messages[conversation.messages.length - 1]
                        .content
                    }
                  </span>
                )}
              </div>{' '}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}

const userSeenConversation = (
  conversation: Conversation,
  userId?: string
): boolean => {
  if (!userId) return false;

  const seen = conversation.messages.every((mess) => {
    return mess.seen.some((seenUser) => seenUser.id === userId);
  });
  return seen;
};
