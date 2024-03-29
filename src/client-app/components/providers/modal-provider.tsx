'use client';

import { useEffect, useState } from 'react';
import { CreateConversation } from '../modals/create-conversation-modal';
import { DeleteConversationModal } from '../modals/delete-conversation-modal';

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
    </>
  );
};
