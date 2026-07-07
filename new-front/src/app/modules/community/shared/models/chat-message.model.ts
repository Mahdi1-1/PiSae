export type MessageType = 'CHAT' | 'PRIVATE' | 'JOIN' | 'LEAVE' | 'INVITATION';

export interface ChatMessage {
  id?: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  type: MessageType;
  read: boolean;
  sentAt?: string;
}