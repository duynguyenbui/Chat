'use client';

import { useEffect, useState } from 'react';
import { CreateConversation } from '../modals/create-conversation-modal';
import { DeleteConversationModal } from '../modals/delete-conversation-modal';
import ImageModal from '../modals/image-modal';
import ChangeAvatarModal from '../modals/change-avatar-modal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <>
      <DeleteConversationModal />
      <CreateConversation />
      <ImageModal />
      <ChangeAvatarModal />
    </>
  );
};
