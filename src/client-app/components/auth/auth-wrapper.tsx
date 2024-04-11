'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { PropsWithChildren } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useModal } from '@/hooks/use-store-modal';
import { useCurrentUser } from '@/hooks/use-current-user';

export const AuthWrapper = ({
  children,
  isLogo,
  backUrl,
  large,
  user,
}: PropsWithChildren & {
  isLogo: boolean;
  backUrl?: string;
  large?: boolean;
  user?: User;
}) => {
  const { onOpen } = useModal();

  return (
    <Card
      className={cn(
        'mt-20 dark:shadow-lg shadow-xl',
        large ? 'w-[460px]' : 'w-[400px]'
      )}
    >
      <CardHeader className="flex items-start">
        <div className="flex gap-72 justify-between">
          <div>
            <Image src="/logo.svg" height={40} width={40} alt="Logo" />
            {isLogo && <div className="text-xl font-semibold">Chat</div>}
          </div>
          {user && (
            <div
              className="mt-2"
              onClick={() => onOpen('changeAvatar', { image: user?.image })}
            >
              <Avatar>
                <AvatarImage src={user?.image} alt="Avatar" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <Button variant="link" className="font-normal w-full" size="sm" asChild>
          <Link href={backUrl || '/'}>Back</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
