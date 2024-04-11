'use client';

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useModal } from '@/hooks/use-store-modal';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useToast } from '@/components/ui/use-toast';
import { changeAvatar } from '@/actions/avatar';
import { title } from 'process';

const ChangeAvatarModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const user = useCurrentUser();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    fileInputRef?.current?.click();
  };

  const handleChangeAvatar = async (event: any) => {
    if (!user) {
      toast({
        title: 'User is missing',
        variant: 'destructive',
      });
    }

    const selectedFile = event.target.files[0];

    if (selectedFile !== null) {
      var formData = new FormData();
      formData.append('image', selectedFile);

      changeAvatar(formData)
        .then((res) =>
          toast({ title: 'Change avatar successfully', variant: 'default' })
        )
        .catch((err) => toast({ title: err.message, variant: 'destructive' }));
    }

    onClose();
  };

  return (
    <Dialog
      open={isOpen && type === 'changeAvatar'}
      onOpenChange={() => onClose()}
    >
      <DialogContent className="mr-2 mb-3 mt-[-20px] flex w-2/4 h-2/4 justify-center items-center">
        <div className="flex flex-col justify-center items-center dark:hover:bg-dark-input ml-2 dark:hover:text-white h-full w-full">
          <Avatar className="w-[300px] h-[300px]" onClick={handleClick}>
            <AvatarImage src={data.image} alt="Avatar" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChangeAvatar}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeAvatarModal;
