export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  readBy: { [userId: string]: boolean };
  fileName?: string;
};

export type Chat = {
  id: string;
  participants: string[]; // array of user IDs
  lastMessage: Message | null;
};
