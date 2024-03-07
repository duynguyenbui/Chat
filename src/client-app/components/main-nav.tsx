import Image from 'next/image';

import CustomLink from './custom-link';
import React from 'react';
import { Button } from './ui/button';

export default function MainNav() {
  return (
    <div className="flex items-center space-x-2 lg:space-x-6">
      <CustomLink href="/">
        <Button variant="ghost" className="p-0">
          <Image src="/logo.svg" alt="Home" width="40" height="40" />
        </Button>
      </CustomLink>
    </div>
  );
}
