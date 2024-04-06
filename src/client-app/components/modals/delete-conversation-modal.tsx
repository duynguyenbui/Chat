'use client';

import { deleteConversation } from '@/actions/conversations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/use-store-modal';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { toast } from 'sonner';

export function DeleteConversationModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const onSubmit = () => {
    startTransition(() => {
      deleteConversation(data.conversation.conversationId)
        .then((data) => {
          if (data?.error) {
            toast.error(data.error);
          }

          if (data?.success) {
            toast.success(data.success);
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error('Something went wrong. Please try again later.');
        })
        .finally(() => {
          onClose();
          router.push('/conversations');
        });
    });
  };

  return (
    <AlertDialog
      open={isOpen && type === 'deleteConversation'}
      onOpenChange={() => onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            conversation and remove your data of conversation from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
