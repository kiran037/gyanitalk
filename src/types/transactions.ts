// src/types/transactions.ts
export interface ManualTransaction {
  id: number;
  paymentMode: string | null;
  paymentReference: string | null;
  attachment: string | null;
  amount: number | null;
  userId: string | null;
  paymentStatus: string | null;
  created_at: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    profile: string | null;
    contactNo: string;
  } | null;
}
