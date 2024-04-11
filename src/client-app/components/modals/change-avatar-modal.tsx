'use client';

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useModal } from '@/hooks/use-store-modal';
import { FileImage } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const ChangeAvatarModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    fileInputRef?.current?.click();
  };

  const handleChangeAvatar = () => {
    // TODO: handle change avatar
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
