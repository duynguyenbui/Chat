import { auth } from '@/auth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const HomePage = async () => {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <Image src="/logo.svg" width={64} height={64} alt="Logo" />
        <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl lg:text-5xlxl">
          chat Reference Application
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-md sm:leading-8">
          This app uses dotnet 8 and Next.js 14
        </p>
        <div className="flex gap-2">
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ size: 'default' }))}
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
