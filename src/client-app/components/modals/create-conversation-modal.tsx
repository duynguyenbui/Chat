import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useModal } from '@/hooks/use-store-modal';
import { CreateConversationSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createConversation } from '@/actions/conversations';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { getUsers } from '@/actions/users';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export const CreateConversation = () => {
  const { isOpen, onClose, type } = useModal();
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    getUsers()
      .then((users) => setUsers(users))
      .catch((err) => toast.error(err.message));
  }, []);

  const form = useForm<z.infer<typeof CreateConversationSchema>>({
    resolver: zodResolver(CreateConversationSchema),
    defaultValues: {
      name: '',
      userId: '',
      members: [],
      isGroup: false,
    },
  });
  const isLoading = form.formState.isSubmitting;

  const onSubmit = (values: z.infer<typeof CreateConversationSchema>) => {
    startTransition(() => {
      createConversation(values)
        .then((data) => {
          if (data?.error) {
            form.reset();
            toast.error(data.error);
          }
          if (data?.success) {
            form.reset();
            toast.success(data.success);
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error('Something went wrong. Please try again later.');
        })
        .finally(() => {
          form.reset();
          onClose();
          router.push('/conversations/');
        });
    });
  };

  return (
    <Dialog
      open={isOpen && type === 'createConversation'}
      onOpenChange={() => {
        form.reset();
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="ml-6">Conversation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2 px-6">
              <FormField
                control={form.control}
                name="name"
                disabled={!form.getValues('isGroup')}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conversation name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Enter conversation name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Select
                      disabled={form.getValues('isGroup')}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user to pair" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.getValues('isGroup') && (
                <FormField
                  control={form.control}
                  name="members"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Users</FormLabel>
                      </div>
                      {users.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="members"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value!,
                                            item.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {item.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="isGroup"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4">
                    <FormLabel>Is Group</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4">
              <Button variant="default" disabled={isLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
