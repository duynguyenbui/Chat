import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { auth } from '@/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SignIn, SignOut } from './auth/auth-components';
import Link from 'next/link';
import { Settings2Icon, UserCircle2Icon } from 'lucide-react';
import { ModeToggle } from './ui/mode-toggle';

export default async function UserButton() {
  const session = await auth();
  if (!session)
    return (
      <div className="flex items-center space-x-3">
        <ModeToggle />
        <SignIn provider="Credentials" />
      </div>
    );

  return (
    <div className="flex items-center space-x-3">
      <ModeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative w-10 h-10 rounded-full">
            <Avatar className="w-10 h-10">
              {session.user.image && (
                <AvatarImage
                  src={session.user.image}
                  alt={session.user.name ?? ''}
                />
              )}
              <AvatarFallback>
                <AvatarImage
                  src={session.user.image}
                  alt={session.user.image ?? ''}
                />
                {session?.user.email.charAt(0).toUpperCase() || 'Y'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem>
            <Link href="/conversations" className="flex p-2 text-end">
              <UserCircle2Icon className="w-5 h-5 mr-2" />
              Conversations
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/auth/settings" className="flex p-2 text-end">
              <Settings2Icon className="w-5 h-5 mr-2" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-center">
            <SignOut />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
