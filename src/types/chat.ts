export type ChatMessage = {
  name: string;
  message: string;
  messageId: string;
  sender_id: string;
  receiver_id: string;
  replymsg?: string;
  createdAt: string;
};