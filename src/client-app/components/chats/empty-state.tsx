import React from 'react';

export const EmptyState = ({ content }: { content: string }) => {
  return (
    <div className=" px-4 py-10 sm:px-6 lg:px-8 lg:py-6 h-full flex justify-center items-center">
      <div className="text-center items-center flex flex-col">
        <h3 className="mt-2 text-2xl text-muted-foreground font-semibold">
          {content}
        </h3>
      </div>
    </div>
  );
};
