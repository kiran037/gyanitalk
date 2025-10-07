// app/customers/CustomersClient.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Eye,
  Search,
  Users,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ExportButton from "@/components/ExportButton";
import { useToast } from "@/components/Toast/ToastProvider";
import { cn } from "@/lib/utils";
import { addMoneyToWallet, searchCustomers } from "./fetch";

type Props = {
  data: any[];
  totalPages: number;
  total: number;
  currentPage: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  // Server Action passed from page.tsx
  exportAllAction: (args: {
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<object[]>;
};

// ---- client-only helpers ----
const isValidImageUrl = (url?: string) => {
  if (!url) return false;
  try {
    const u = new URL(url, process.env.NEXT_PUBLIC_BASEURL);
    return /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(u.pathname);
  } catch {
    return false;
  }
};

const avatarSrc = (profile?: string) =>
  isValidImageUrl(profile)
    ? `${process.env.NEXT_PUBLIC_BASEURL}${profile}`
    : "https://gyanitalk.com/build/assets/images/person.png";

const toINR = (n: any) => `₹${Number(n || 0).toFixed(2)}`;

const buildPageHref = ({
  page,
  search,
  startDate,
  endDate,
}: {
  page: number;
  search?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (search) params.set("search", search);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  return `?${params.toString()}`;
};

export default function CustomersClient({
  data,
  totalPages,
  total,
  currentPage,
  search,
  startDate,
  endDate,
  exportAllAction,
}: Props) {
  const toast = useToast();

  useEffect(() => {
    if (data.length === 0 && (search || startDate || endDate)) {
      toast(
        "warning",
        "No Results",
        "Try adjusting your search or date filters."
      );
    }
  }, [data.length, search, startDate, endDate, toast]);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      const fd = new FormData(e.currentTarget);
      const sd = (fd.get("startDate") as string) || "";
      const ed = (fd.get("endDate") as string) || "";

      if (sd && ed && new Date(sd) > new Date(ed)) {
        e.preventDefault();
        toast(
          "warning",
          "Warning",
          "Start date must be before End date."
        );
      }
      // Otherwise let the GET submit reload the page with new filters
    },
    [toast]
  );

  // ----------- Add Money modal state & logic -----------
  const [isAddMoneyOpen, setAddMoneyOpen] = useState(false);
  const [custQuery, setCustQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const results = await searchCustomers(query);
      setSuggestions(results);
    } catch (err) {
      console.error("search error:", err);
      setSuggestions([]);
    }
  }, []);


  useEffect(() => {
    // simple debounce
    const t = setTimeout(() => {
      handleSearch(custQuery);
    }, 200);
    return () => clearTimeout(t);
  }, [custQuery, handleSearch]);

  const openAddMoneyModal = useCallback(() => {
    setAddMoneyOpen(true);
    setCustQuery("");
    setSuggestions([]);
    setSelectedCustomer(null);
    setAmount("");
  }, []);

  const closeAddMoneyModal = useCallback(() => {
    setAddMoneyOpen(false);
  }, []);

  const onConfirmAddMoney = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault?.();
      if (!selectedCustomer) {
        toast("warning", "Select Customer", "Please pick a customer.");
        return;
      }
      const amt = Number(amount);
      if (isNaN(amt) || amt <= 0) {
        toast("warning", "Invalid Amount", "Amount must be positive.");
        return;
      }

      setIsSubmitting(true);
      const res = await addMoneyToWallet({
        userId: selectedCustomer.id,
        amount: amt,
      });
      setIsSubmitting(false);

      if (res?.status) {
        toast("success", "Added", res.message);
        closeAddMoneyModal();
        // optional: refresh page or SWR revalidate here
      } else {
        toast("error", "Error", res?.message || "Could not add money");
      }
    },
    [selectedCustomer, amount, addMoneyToWallet, toast, closeAddMoneyModal]
  );


  // When user clicks a suggestion
  const pickSuggestion = (c: any) => {
    setSelectedCustomer(c);
    setCustQuery(`${c.name || "Unnamed"} • ${c.contactNo || ""}`);
    setSuggestions([]);
  };

  // derived display label for Total card to include Add Money button
  const TotalStat = useMemo(
    () => (
      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/[0.06] backdrop-blur-xl shadow-sm">
        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          Total: {total} customers
        </span>

        {/* spacer */}
        <div className="ml-3" />

        {/* Add Money quick button */}
        <button
          onClick={openAddMoneyModal}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-sm transition"
          title="Add money to a customer's wallet"
        >
          <Wallet className="h-4 w-4" />
          Add Money
        </button>
      </div>
    ),
    [total, openAddMoneyModal]
  );

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient liquid glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-40 w-[24rem] h-[24rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[26rem] h-[26rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[46rem] h-[18rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative w-full  mx-auto p-6 md:p-8 space-y-6">
        {/* Header / Stats card */}
        <div className="backdrop-blur-2xl supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-white/10 bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent pointer-events-none" />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="inline-flex w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-200" />
                  <span className="inline-flex w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-500" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                  Customer Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage and track your customer relationships
                </p>
              </div>

              {/* REPLACED HERE: TotalStat (includes Add Money button) */}
              {TotalStat}
            </div>

            {/* Filters */}
            <form method="get" onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Search customers…"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl border-white/30 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition"
                />
              </div>

              <input
                type="date"
                name="startDate"
                defaultValue={startDate}
                className="px-3 py-2 text-sm rounded-xl border bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl border-white/30 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition"
              />

              <input
                type="date"
                name="endDate"
                defaultValue={endDate}
                className="px-3 py-2 text-sm rounded-xl border bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl border-white/30 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition"
              />

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition"
              >
                <Search className="h-4 w-4" />
                Search
              </button>

              {/* Export: lazily loads all data via server action */}
              <ExportButton
                type="json"
                // Do NOT pass jsonData here; pull it on-demand:
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
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.25)] transition"
              />
            </form>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="backdrop-blur-2xl bg-white/50 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 rounded-2xl p-8 text-center">
              <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No customers found
              </h3>
              <p className="text-slate-500 dark:text-slate-500 text-sm">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {data.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden backdrop-blur-2xl bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 rounded-2xl p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    {/* avatar + identity */}
                    <Link href={`/customers/${item.id}`} className="flex items-center gap-4 min-w-0">
                      <div className="relative">
                        <Image
                          src={avatarSrc(item?.profile)}
                          width={48}
                          height={48}
                          alt={`${item.name || "User"} Avatar`}
                          className="rounded-full object-cover ring-2 ring-white/70 dark:ring-white/10 shadow-sm"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 block w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="font-semibold truncate text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {item.name || "Unnamed Customer"}
                        </h3>
                        <p
                          className="text-sm text-slate-500 dark:text-slate-400 truncate cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            if (item.contactNo) {
                              navigator.clipboard
                                .writeText(item.contactNo)
                                .then(() =>
                                  toast("warning", "Copied", "Contact number copied to clipboard.")
                                )
                                .catch(() =>
                                  toast("error", "Error", "Could not copy to clipboard.")
                                );
                            }
                          }}
                          title="Click to copy"
                        >
                          {item.contactNo || "No contact"}
                        </p>
                      </div>
                    </Link>

                    {/* meta (md+) */}
                    <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
                      <MetaBlock
                        label="Date of Birth"
                        value={
                          item.birthDate ? dayjs(item.birthDate).format("DD MMM YYYY") : "Not provided"
                        }
                      />
                      <MetaBlock label="Time of Birth" value={item.birthTime || "Not provided"} />
                      <MetaBlock
                        label="Joined"
                        value={
                          item.created_at ? dayjs(item.created_at).format("DD MMM YYYY") : "Unknown"
                        }
                      />
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                          Balance
                        </p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          {toINR(item.balance)}
                        </p>
                      </div>
                    </div>

                    {/* action */}
                    <div className="shrink-0">
                      <Link
                        href={`/customers/${item.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-blue-700 dark:text-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/35 dark:hover:to-indigo-900/35 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </div>
                  </div>

                  {/* mobile meta */}
                  <div className="md:hidden mt-3 pt-3 border-t border-white/40 dark:border-white/10">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <MetaRow
                        label="DOB"
                        value={item.birthDate ? dayjs(item.birthDate).format("DD MMM YYYY") : "N/A"}
                      />
                      <MetaRow label="Balance" value={toINR(item.balance)} accent />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 rounded-2xl p-4 shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex items-center gap-1">
                {currentPage > 1 && (
                  <Link
                    href={buildPageHref({
                      page: currentPage - 1,
                      search: search ?? null,
                      startDate: startDate ?? null,
                      endDate: endDate ?? null,
                    })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.09] transition"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </Link>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    const isCurrent = pageNum === currentPage;
                    const show =
                      pageNum <= 3 ||
                      pageNum === totalPages ||
                      pageNum === currentPage ||
                      pageNum === currentPage - 1 ||
                      pageNum === currentPage + 1;

                    if (!show) {
                      if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return (
                          <span key={i} className="px-1 text-slate-400 text-sm">
                            …
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <Link
                        key={i}
                        href={buildPageHref({
                          page: pageNum,
                          search: search ?? null,
                          startDate: startDate ?? null,
                          endDate: endDate ?? null,
                        })}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-xl font-medium transition text-sm",
                          isCurrent
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                            : "bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.09]"
                        )}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={buildPageHref({
                      page: currentPage + 1,
                      search: search ?? null,
                      startDate: startDate ?? null,
                      endDate: endDate ?? null,
                    })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.09] transition"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Money Modal */}
        {isAddMoneyOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeAddMoneyModal}
            />
            <form
              onSubmit={onConfirmAddMoney}
              className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-white/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Add Money to Wallet
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Search by name or phone, select customer and add amount.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeAddMoneyModal}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-sm text-slate-600 dark:text-slate-300">
                  Customer (name / phone)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={custQuery}
                    onChange={(e) => {
                      setCustQuery(e.target.value);
                      setSelectedCustomer(null);
                    }}
                    placeholder="Type name or phone..."
                    className="w-full px-3 py-2 rounded-xl border bg-white/60 dark:bg-white/[0.02] border-white/30 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    aria-autocomplete="list"
                    aria-controls="customer-suggestions"
                    aria-expanded={suggestions.length > 0}
                  />

                  {/* suggestions dropdown */}
                  {suggestions.length > 0 && (
                    <ul
                      id="customer-suggestions"
                      className="absolute left-0 right-0 mt-2 max-h-60 overflow-auto rounded-xl bg-white dark:bg-slate-800 border border-white/20 shadow-md z-30"
                    >
                      {suggestions.map((c) => (
                        <li
                          key={c.id}
                          onClick={() => pickSuggestion(c)}
                          className="px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={avatarSrc(c.profile)}
                              width={32}
                              height={32}
                              alt={`${c.name || "User"} avatar`}
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {c.name || "Unnamed"}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {c.contactNo || "No contact"} • id: {c.id}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300">
                    Selected Customer
                  </label>
                  <div className="px-3 py-2 rounded-xl border bg-white/50 dark:bg-white/[0.02] border-white/20">
                    {selectedCustomer ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={avatarSrc(selectedCustomer.profile)}
                            width={36}
                            height={36}
                            alt={`${selectedCustomer.name} avatar`}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {selectedCustomer.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {selectedCustomer.contactNo} • id: {selectedCustomer.id}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 dark:text-slate-400">No customer selected</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 rounded-xl border bg-white/60 dark:bg-white/[0.02] border-white/30 dark:border-white/10 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={closeAddMoneyModal}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border text-sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding…" : "Add Money"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
}
function MetaRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-slate-400 text-[10px] uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={cn(
          "font-medium",
          accent
            ? "text-emerald-600 dark:text-emerald-400 font-bold"
            : "text-slate-700 dark:text-slate-300"
        )}
      >
        {value}
      </p>
    </div>
  );
}
