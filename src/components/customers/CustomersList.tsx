// src/components/customers/CustomersList.tsx
"use client";

import { Users } from "lucide-react";
import CustomerCard from "./CustomerCard";

export default function CustomersList({ data }: { data: any[] }) {
  if (!data?.length) {
    return (
      <div className="backdrop-blur-2xl bg-white/50 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 rounded-2xl p-8 text-center">
        <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">No customers found</h3>
        <p className="text-slate-500 dark:text-slate-500 text-sm">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {data.map((item: any, idx: number) => (
        <CustomerCard key={idx} item={item} />
      ))}
    </div>
  );
}
