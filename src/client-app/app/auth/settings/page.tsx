'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';

import { SettingsSchema } from '@/schemas';
import { Button } from '@/components/ui/button';
import { settings } from '@/actions/settings';
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/use-current-user';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { toast } from 'sonner';

const SettingsPage = () => {
  const user = useCurrentUser();

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      oldPassword: undefined,
      newPassword: undefined,
      email: user?.email || undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          }

          if (data.success) {
            toast.success(data.success);
          }
        })
        .catch((err) => console.log(err));
    });
  };

  return (
    <AuthWrapper isLogo large>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <FormItem>
              <FormLabel>Sub</FormLabel>
              <Input placeholder={user?.id} disabled readOnly />
            </FormItem>
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input placeholder={user?.name} disabled readOnly />
            </FormItem>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={user?.email}
                      type="email"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Old Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="******"
                        type="password"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="******"
                        type="password"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <FormItem>
              <FormLabel>Access Token</FormLabel>
              <Input value={user?.access_token} readOnly />
            </FormItem>
            <FormItem>
              <FormLabel>Refresh Token</FormLabel>
              <Input value={user?.refresh_token} readOnly />
            </FormItem>
            <div className="flex gap-6">
              <FormItem>
                <FormLabel>Expires In</FormLabel>
                <Input value={user?.expires_in.toString()} readOnly />
              </FormItem>
              <FormItem>
                <FormLabel>Issued At</FormLabel>
                <Input value={user?.issued_at.toString()} readOnly />
              </FormItem>
            </div> */}
          </div>
          <p className="text-sm text-muted-foreground font-light">
            You must login again to apply this configuration
          </p>
          <Button disabled={isPending} type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default SettingsPage;
