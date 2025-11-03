// src/components/customers/CustomerCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { Eye, Wallet } from "lucide-react";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import { MetaBlock, MetaRow } from "./Meta";
import { avatarSrc, toINR } from "./utils";
import { useToast } from "@/components/Toast/ToastProvider";

export default function CustomerCard({ item }: { item: any }) {
  const toast = useToast();

  return (
    <GlassCard className="p-4 group relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 flex items-center justify-between gap-4">
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
                    .then(() => toast("warning", "Copied", "Contact number copied to clipboard."))
                    .catch(() => toast("error", "Error", "Could not copy to clipboard."));
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
          <MetaBlock label="Date of Birth" value={item.birthDate ? dayjs(item.birthDate).format("DD MMM YYYY") : "Not provided"} />
          <MetaBlock label="Time of Birth" value={item.birthTime || "Not provided"} />
          <MetaBlock label="Joined" value={item.created_at ? dayjs(item.created_at).format("DD MMM YYYY") : "Unknown"} />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">Balance</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              {toINR(item.balance)}
            </p>
          </div>
        </div>

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
          <MetaRow label="DOB" value={item.birthDate ? dayjs(item.birthDate).format("DD MMM YYYY") : "N/A"} />
          <MetaRow label="Balance" value={toINR(item.balance)} accent />
        </div>
      </div>
    </GlassCard>
  );
}
