import { FileImage, SendHorizontal, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { buttonVariants } from '../ui/button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Textarea } from '../ui/textarea';
import { EmojiPicker } from './emoji-picker';
import { Message, User } from '@/types';
import ChatImageUpload from './chat-image';
import { generateMessage } from '@/lib/message-utils';

interface ChatBottombarProps {
  sendMessage: (newMessage: Message) => void;
  isMobile: boolean;
  loggedInUserData: User;
  conversationId?: string;
  isAIConversation?: boolean;
}

export default function ChatBottombar({
  sendMessage,
  isMobile,
  loggedInUserData,
  conversationId,
  isAIConversation = false,
}: ChatBottombarProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleThumbsUp = () => {
    const newMessage = generateMessage('👍', loggedInUserData);
    sendMessage(newMessage);
    setMessage('');
  };

  const handleSend = () => {
    const newMessage = generateMessage(message, loggedInUserData);
    sendMessage(newMessage);
    setMessage('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }

    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      setMessage((prev) => prev + '\n');
    }
  };

  return (
    <div className="p-2 flex justify-between w-full items-center gap-2">
      {!isAIConversation && (
        <div className="flex">
          {!message.trim() && !isMobile && (
            <div className="flex">
              {/* TODO: Chat Image Upload Button */}
              <ChatImageUpload conversationId={conversationId!} />
            </div>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        <motion.div
          key="input"
          className="w-full relative"
          layout
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.05 },
            layout: {
              type: 'spring',
              bounce: 0.15,
            },
          }}
        >
          <Textarea
            autoComplete="off"
            value={message}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            name="message"
            placeholder="Aa"
            className=" w-full border rounded-full flex items-center h-6 p-3 resize-none overflow-hidden bg-background"
          ></Textarea>
          <div className="absolute right-2 bottom-6">
            <EmojiPicker
              onChange={(value) => {
                setMessage(message + value);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            />
          </div>
        </motion.div>

        {message.trim() ? (
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'h-9 w-9',
              'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0'
            )}
            onClick={handleSend}
          >
            <SendHorizontal size={20} className="text-muted-foreground" />
          </Link>
        ) : !isAIConversation ? (
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'h-9 w-9',
              'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0'
            )}
            onClick={handleThumbsUp}
          >
            <ThumbsUp size={20} className="text-muted-foreground" />
          </Link>
        ) : (
          <></>
        )}
      </AnimatePresence>
    </div>
  );
}
