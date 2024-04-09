'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { useModal } from '@/hooks/use-store-modal';
import Image from 'next/image';

const ImageModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  return (
    <Dialog
      open={isOpen && type === 'showImage'}
      onOpenChange={() => onClose()}
    >
      <DialogContent className="w-full aspect-video h-auto">
        <div className="object-fill">
          <Image
            alt={data.messageId}
            // TODO: Change URL to environment in order to deploy with nginx
            src={`http://localhost:5000/api/v1/chat/messages/${data.messageId}/pic`}
            fill
            unoptimized={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
