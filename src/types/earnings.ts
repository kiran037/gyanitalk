// src/types/earnings.ts
export interface Withdrawal {
  id: string;
  astrologerId: string;
  withdrawAmount: string;
  status: string;
  paymentMethod: number | null;
  upiId: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  accountHolderName: string | null;
  created_at: string;
  updated_at: string;
  astrologer: {
    id: string;
    name: string;
    email: string;
    contactNo: string;
    profileImage: string | null;
  } | null;
  withdrawmethod: {
    id: number;
    method_name: string;
  } | null;
}
