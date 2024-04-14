export interface Conversation {
  conversationId: string;
  name: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages: Message[];
  users: User[];
}

export interface Message {
  messageId: string;
  content: string;
  imageFileName: string;
  createdAt: string;
  updatedAt: string;
  sender: User;
  seen: User[];
  image?: FileList | null | undefined;
}

export interface User {
  id: string;
  image?: string;
  name: string;
  email: string;
}

export interface TokenResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface HistoryItem {
  role: string;
  content: string;
}
