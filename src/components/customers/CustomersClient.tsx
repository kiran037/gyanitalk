// src/components/customers/CustomersClient.tsx
"use client";

import { useEffect, useState } from "react";
import CustomersHeader from "./CustomersHeader";
import CustomersFilters from "./CustomersFilters";
import CustomersList from "./CustomersList";
import CustomersPagination from "./CustomersPagination";
import AddMoneyModal from "./AddMoneyModal";
import AddCustomerModal from "./AddCustomerModal";
import { CustomersClientProps } from "./types";
import { useToast } from "@/components/Toast/ToastProvider";
import { GlassCard } from "@/components/GlassUI/GlassKit";

export default function CustomersClient({
  data,
  totalPages,
  total,
  currentPage,
  search,
  startDate,
  endDate,
  exportAllAction,
}: CustomersClientProps) {
  const toast = useToast();

  useEffect(() => {
    if (data.length === 0 && (search || startDate || endDate)) {
      toast("warning", "No Results", "Try adjusting your search or date filters.");
    }
  }, [data.length, search, startDate, endDate, toast]);

  const [isAddMoneyOpen, setAddMoneyOpen] = useState(false);
  const [isAddUserOpen, setAddUserOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden isolate bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows (isolated under content, cannot wash over children) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-40 w-[24rem] h-[24rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[26rem] h-[26rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[46rem] h-[18rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full p-6 md:p-8 space-y-6">
        <CustomersHeader total={total} onOpenAddMoney={() => setAddMoneyOpen(true)} />

        <GlassCard className="p-6" hover={false}>
          <CustomersFilters
            search={search}
            startDate={startDate}
            endDate={endDate}
            exportAllAction={exportAllAction}
            onOpenAddUser={() => setAddUserOpen(true)}
          />
        </GlassCard>

        <CustomersList data={data} />

        <CustomersPagination
          totalPages={totalPages}
          currentPage={currentPage}
          search={search}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      {/* Modals */}
      <AddMoneyModal open={isAddMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
      <AddCustomerModal open={isAddUserOpen} onClose={() => setAddUserOpen(false)} />
    </div>
  );
}
