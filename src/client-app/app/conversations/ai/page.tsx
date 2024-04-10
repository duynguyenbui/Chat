import { EmptyState } from '@/components/chats/empty-state';
import { auth } from '@/auth';
import ChatBottombar from '@/components/chats/chat-bottombar';
import { Message } from '@/types';
import ChatAI from '@/components/chats/chat-ai';

const AIConversation = async () => {
  const session = await auth();

  if (!session) {
    return <EmptyState content="AI Conversation" />;
  }

  const user = {
    id: session.user.id,
    email: session.user.email,
    image: session.user.image,
    name: session.user.name,
  };

  return <ChatAI user={user} />;
};

export default AIConversation;
