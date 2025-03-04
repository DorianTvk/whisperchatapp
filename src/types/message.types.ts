
export interface ChatMessage {
  id: string;
  chatId: string; // can be userId for direct messages or groupId for group chats
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isOwnMessage?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
}
