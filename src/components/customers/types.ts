// src/components/customers/types.ts
export type CustomerItem = {
  id: number | string | bigint;
  name?: string | null;
  contactNo?: string | null;
  birthDate?: string | Date | null;
  birthTime?: string | null;
  profile?: string | null;
  balance?: number | string | null;
  created_at?: string | Date | null;
};

export type CustomersClientProps = {
  data: CustomerItem[];
  totalPages: number;
  total: number;
  currentPage: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  exportAllAction: (args: { search?: string; startDate?: string; endDate?: string }) => Promise<object[]>;
};
