'use client';

import * as React from 'react';
import { findMessage } from '@/actions/message';
import { Message } from '@/types';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageCircle, Search } from 'lucide-react';

export function CommandSearch({ conversationId }: { conversationId: string }) {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [result, setResult] = React.useState<Message[]>([]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        ((e.key === 'j' || e.key === 'k') && (e.metaKey || e.ctrlKey)) ||
        e.key === 'Escape'
      ) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => {
      setInput('');
      setResult([]);
      document.removeEventListener('keydown', down);
    };
  }, []);

  React.useEffect(() => {
    findMessage(conversationId, input)
      .then((res) => setResult(res as Message[]))
      .catch((err) => setResult([]));
  }, [conversationId, input]);

  console.log(input);
  console.log(result);
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Press{' '}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>J
        </kbd>{' '}
        to search for messages
      </p>
      <Dialog open={open}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center p-2">
            <Search className="w-5 h-5 mr-2" />
            <Input
              placeholder="Type whatever do you want to search..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mr-2"
            />
          </div>
          {result.length === 0 ? (
            <div className="text-sm text-center text-muted-foreground">
              No results found.
            </div>
          ) : (
            result.map((mess) => (
              <div
                key={mess.messageId}
                className="flex items-center gap-3 p-3 text-sm text-muted-foreground"
              >
                <MessageCircle className="w-5 h-5" />
                <div className="flex flex-col justify-between w-full">
                  <div className="flex justify-between items-center">
                    <span>{mess.content}</span>
                    <span className="text-sm">{mess.sender.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <time>
                      {format(new Date(mess.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </time>
                  </div>
                </div>
              </div>
            ))
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
