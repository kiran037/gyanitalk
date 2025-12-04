// src/types/support.ts
export interface TicketData {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  ticketStatus: string;
  userId: string;
  helpSupportId: string;
  chatId: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    contactNo: string;
  } | null;
  help_support: {
    id: string;
    name: string;
  } | null;
  ticketreview: Array<{
    id: number;
    rating: number | null;
    review: string | null;
    created_at: string;
  }>;
}
