// // components/details/giftList.tsx
"use client";

import { format } from "date-fns";
import Image from "next/image";
import { GlassCard } from "@/components/GlassUI/GlassKit";

const abs = (p?: string) => (p ? `${process.env.NEXT_PUBLIC_BASEURL}${p.startsWith("/") ? "" : "/"}${p}` : "");
const avatar = (p?: string) => abs(p) || "https://gyanitalk.com/build/assets/images/person.png";

/* Admin / Astro side */
export default function GiftList({ gifts = [] }: { gifts?: any[] }) {
  return (
    <div className="p-6">
      <GlassCard>
        <div className="relative px-4 pt-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Gift History</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">All gifts received</p>
        </div>

        <div className="relative grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr_1fr] gap-4 border-t border-white/60 dark:border-white/10 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <div>Name</div><div>Gift Icon</div><div>Gift Name</div><div>Amount</div><div>Date</div>
        </div>

        <div className="relative divide-y divide-white/60 dark:divide-white/10 text-sm">
          {gifts.length ? (
            gifts.map((g) => {
              const userName = g?.user?.name || "Unknown";
              const amount = g?.giftAmount || 0;
              const icon = g?.gift?.image;
              const giftName = g?.gift?.name || "Unknown";
              const date = g?.created_at ? format(new Date(g.created_at), "dd MMM yyyy, hh:mm a") : "N/A";

              return (
                <div key={g.id} className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr_1fr] items-center gap-4 px-4 py-3">
                  <div className="truncate font-medium text-slate-900 dark:text-white">{userName}</div>
                  <div className="flex items-center">
                    <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/10 shadow-sm">
                      <Image src={avatar(icon)} alt={`${giftName} Icon`} width={40} height={40} className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="truncate text-slate-700 dark:text-slate-300">{giftName}</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">₹ {amount}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{date}</div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">No gifts found.</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

/* User side */
export function UserGiftList({ gifts = [] }: { gifts?: any[] }) {
  return (
    <div className="p-6">
      {gifts.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((g) => {
            const astrologerName = g?.astrologer?.name || "Unknown";
            const giftName = g?.gift?.name || "Unknown";
            const giftImage = g?.gift?.image;
            const giftAmount = g?.giftAmount || 0;
            const date = g?.created_at ? format(new Date(g.created_at), "dd MMM yyyy, hh:mm a") : "N/A";

            return (
              <GlassCard key={g.id} className="p-4 hover:-translate-y-0.5 transition">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/10 shadow-sm">
                    <Image src={avatar(giftImage)} alt={`${giftName} Icon`} width={56} height={56} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{giftName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Sent to: {astrologerName}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">₹ {giftAmount}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{date}</div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard className="p-6 text-center text-slate-500 dark:text-slate-400">No gifts found.</GlassCard>
      )}
    </div>
  );
}
