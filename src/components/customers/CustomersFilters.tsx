// src/components/customers/CustomersFilters.tsx
"use client";

import { Search } from "lucide-react";
import ExportButton from "@/components/ExportButton";
import { glass } from "@/components/GlassUI/GlassKit";
import { useToast } from "@/components/Toast/ToastProvider";

export default function CustomersFilters({
  search,
  startDate,
  endDate,
  exportAllAction,
  onOpenAddUser,
}: {
  search?: string;
  startDate?: string;
  endDate?: string;
  exportAllAction: (args: { search?: string; startDate?: string; endDate?: string }) => Promise<object[]>;
  onOpenAddUser: () => void;
}) {
  const toast = useToast();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const sd = (fd.get("startDate") as string) || "";
    const ed = (fd.get("endDate") as string) || "";
    if (sd && ed && new Date(sd) > new Date(ed)) {
      e.preventDefault();
      toast("warning", "Warning", "Start date must be before End date.");
    }
  }

  return (
    <form method="get" onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search customers…"
          className={glass.input + " w-full pl-9"}
        />
      </div>

      <input type="date" name="startDate" defaultValue={startDate} className={glass.input} />
      <input type="date" name="endDate" defaultValue={endDate} className={glass.input} />

      <button type="submit" className={glass.btnPrimary}>
        <Search className="h-4 w-4" />
        Search
      </button>

      <ExportButton
        type="json"
        getJsonData={async () => {
          try {
            toast("warning", "Preparing Export", "Fetching all customers…");
            const rows = await exportAllAction({ search, startDate, endDate });
            if (!rows?.length) {
              toast("warning", "No Data", "No rows to export for current filters.");
            } else {
              toast("warning", "Export Ready", `Exporting ${rows.length} rows…`);
            }
            return rows ?? [];
          } catch (e: any) {
            toast("error", "Error", "Failed to fetch data for export.");
            throw e;
          }
        }}
        filename="customers.xlsx"
        sheetName="Customers"
        buttonText="Export"
        className={glass.btnSecondary}
      />

      <button type="button" onClick={onOpenAddUser} className={glass.btnPrimary} title="Add new customer">
        + Add User
      </button>
    </form>
  );
}
