'use client';

import React, { useRef, useState } from 'react';
import { FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import axiosInterceptorInstance from '@/lib/api';
import { sendImage } from '@/actions/send-image';

const ChatImageUpload = ({ conversationId }: { conversationId: string }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState(null);

  const handleClick = () => {
    fileInputRef?.current?.click();
  };

  const handleFileChange = async (event: any) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    console.log(selectedFile);

    console.log(conversationId);

    if (conversationId) {
      var formData = new FormData();
      formData.append('image', selectedFile);

      sendImage(conversationId, formData)
        .then((res) => console.log(res))
        .catch((error) => console.log(error))
        .finally(() => setFile(null));
    }
  };

  return (
    <div>
      <div
        className="h-9 w-9 dark:bg-dark-input dark:text-muted-foreground dark:hover:bg-dark-input ml-2 dark:hover:text-white"
        onClick={handleClick}
      >
        <FileImage />
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ChatImageUpload;
