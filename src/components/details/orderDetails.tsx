
"use client";

import Image from "next/image";
import { format } from "date-fns";
import { useMemo, useState } from "react";

/* helpers */
const abs = (p?: string) => (p ? `${process.env.NEXT_PUBLIC_BASEURL}${p.startsWith("/") ? "" : "/"}${p}` : "");
const placeholder = "https://gyanitalk.com/build/assets/images/person.png";

const OPTIONS = ["All", "Pending", "Confirmed", "Rejected", "Accepted"] as const;

const statusClasses: Record<string, string> = {
  Confirmed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Accepted: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Default: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
};

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "relative rounded-2xl overflow-hidden",
        "bg-white/55 dark:bg-white/[0.06] border border-white/60 dark:border-white/10",
        "backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.03] dark:to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

function Segmented({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl p-1 bg-white/60 dark:bg-white/[0.06] border border-white/50 dark:border-white/10 backdrop-blur-xl">
      {OPTIONS.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={[
              "px-3 py-1.5 text-xs font-medium rounded-lg transition",
              active
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/[0.08]",
            ].join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function StatusBadge({ s }: { s: string }) {
  const cls = statusClasses[s] || statusClasses.Default;
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>{s}</span>;
}

export default function UserOrderDetails({ details }: { details: any[] }) {
  const [filter, setFilter] = useState("All");
  const list = useMemo(() => (filter === "All" ? details : details?.filter((o) => o.orderStatus === filter)), [details, filter]);

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Orders: <span className="font-semibold text-slate-900 dark:text-slate-100">{list?.length || 0}</span>
        </div>
        <Segmented value={filter} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list?.map((order: any) => {
          const product = order.product || {};
          const address = order.order_address || {};
          const createdAt = order.created_at ? format(new Date(order.created_at), "dd MMM yyyy, hh:mm a") : "-";
          return (
            <GlassCard key={order.id} className="hover:-translate-y-0.5 transition">
              {/* header */}
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-white/70 dark:ring-white/10 shadow-sm">
                    <Image
                      src={product?.productImage ? abs(product.productImage) : placeholder}
                      alt="Product"
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {product.name || "Product"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{createdAt}</div>
                  </div>
                </div>
                <StatusBadge s={order.orderStatus} />
              </div>

              {/* body */}
              <div className="grid grid-cols-2 gap-3 border-t border-white/60 dark:border-white/10 p-4 text-sm">
                <div className="text-slate-500 dark:text-slate-400">Amount</div>
                <div className="text-right font-semibold text-slate-900 dark:text-white">₹{order.totalPayable}</div>

                <div className="text-slate-500 dark:text-slate-400">Payment</div>
                <div className="text-right font-medium text-slate-800 dark:text-slate-200">
                  {order.paymentMethod || "-"}
                </div>

                {order.couponCode && (
                  <>
                    <div className="text-slate-500 dark:text-slate-400">Coupon</div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {order.couponCode}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* address */}
              <div className="border-t border-white/60 dark:border-white/10 p-4">
                <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Delivery Address</div>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    {address.name}, {address.flatNo}, {address.locality}, {address.landmark}
                  </div>
                  <div>
                    {address.city}, {address.state}, {address.country} - {address.pincode}
                  </div>
                  <div>
                    {address.countryCode} {address.phoneNumber}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}

        {!list?.length && (
          <GlassCard className="col-span-full">
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">No orders found.</div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
