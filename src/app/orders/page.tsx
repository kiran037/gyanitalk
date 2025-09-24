
"use client";

import { use, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import moment from "moment";
import { ChevronDown, Download } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { isValidImageUrl } from "@/components/functions";
import { cn } from "@/lib/utils";
import { getOrders, changeOrderStatus } from "./fetch";

type Order = {
  id: number;
  payableAmount: number;
  gstAmount: number;
  orderStatus: string;
  created_at: string;
  user: { name: string; email: string; profile?: string | null };
  product: { name: string; productImage?: string | null; product_category?: { name: string } };
  order_address?: { flatNo: string; city: string; state: string; pincode: string };
};

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = use(searchParams);
  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await getOrders({ page, limit: 15, search });
      if (!mounted) return;
      setOrders(res.orders || []);
      setTotalPages(res.totalPages || 1);
      setCurrentPage(res.currentPage || page);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [page, search]);

  const updateOrderStatus = (id: number, status: string) => {
    startTransition(async () => {
      const res = await changeOrderStatus(id, status);
      if (res.success) {
        toast("success", "Updated", `Order set to ${status}`);
        setDropdownOpen(null);
        router.refresh();
      } else {
        toast("error", "Error", "Failed to update status");
      }
    });
  };

  return (
    <div className="space-y-8 px-5 py-5">
      <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Orders
      </h1>
    </div>

      {/* Search */}
      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name"
          className="min-w-[250px] rounded-xl border border-white/20 bg-white/60 dark:bg-slate-800/60 backdrop-blur px-4 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2 text-white text-sm shadow hover:scale-105 transition"
        >
          Search
        </button>
      </form>

      {/* Orders List */}
      <div className="rounded-2xl border border-white/20 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 sticky top-0 backdrop-blur">
            <tr>
              <th className="py-3 px-4 text-left">User</th>
              <th className="px-4 text-left">Product</th>
              <th className="px-4 text-center">Amount</th>
              <th className="px-4 text-center">GST</th>
              <th className="px-4 text-center">Order Date</th>
              <th className="px-4 text-center">Status</th>
              <th className="px-4 text-center">Address</th>
              <th className="px-4 text-center">Change</th>
              <th className="px-4 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-white/10 hover:bg-white/40 dark:hover:bg-slate-800/30 transition"
                >
                  <td className="px-4 py-3">{o.user?.name || "User"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          isValidImageUrl(o.product?.productImage)
                            ? `${process.env.NEXT_PUBLIC_BASEURL}${o.product.productImage}`
                            : "https://gyanitalk.com/build/assets/images/person.png"
                        }
                        alt={o.product?.name || "Product"}
                        width={40}
                        height={40}
                        className="rounded-md object-cover shadow"
                      />
                      <div>
                        {o.product?.name}
                        <span className="ml-1 text-xs text-slate-500">
                          ({o.product?.product_category?.name})
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">₹{o.payableAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">₹{o.gstAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    {moment(o.created_at).format("DD MMM YYYY, hh:mm A")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium backdrop-blur",
                        o.orderStatus === "Confirmed"
                          ? "bg-emerald-400/20 text-emerald-600"
                          : "bg-rose-400/20 text-rose-600"
                      )}
                    >
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-center text-slate-600 dark:text-slate-300">
                    {o.order_address
                      ? `${o.order_address.flatNo}, ${o.order_address.city}, ${o.order_address.state} - ${o.order_address.pincode}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {o.orderStatus !== "Cancelled" && (
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setDropdownOpen(dropdownOpen === o.id ? null : o.id)
                          }
                          className="flex items-center gap-1 px-3 py-1 rounded-lg border border-white/20 backdrop-blur hover:bg-white/40"
                        >
                          Change <ChevronDown className="w-4 h-4" />
                        </button>
                        {dropdownOpen === o.id && (
                          <div className="absolute right-0 mt-2 w-36 rounded-xl border border-white/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg z-20">
                            {["Confirmed", "Packed", "Dispatched", "Delivered"].map(
                              (status) => (
                                <button
                                  key={status}
                                  onClick={() => updateOrderStatus(o.id, status)}
                                  disabled={isPending}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/50 dark:hover:bg-slate-800/50"
                                >
                                  {status}
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/orders/invoice_order/${o.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs shadow hover:scale-105"
                    >
                      <Download className="w-4 h-4" /> Invoice
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 text-sm">
        <a
          href={`?page=${Math.max(currentPage - 1, 1)}${search ? `&search=${search}` : ""}`}
          className={cn(
            "px-3 py-1 rounded-full border border-white/20 backdrop-blur",
            currentPage === 1 ? "opacity-50 pointer-events-none" : "hover:bg-white/60"
          )}
        >
          Prev
        </a>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === totalPages ||
              (p >= currentPage - 1 && p <= currentPage + 1)
          )
          .map((p, idx, arr) => (
            <span key={p}>
              {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1">…</span>}
              <a
                href={`?page=${p}${search ? `&search=${search}` : ""}`}
                className={cn(
                  "px-3 py-1 rounded-full border border-white/20 backdrop-blur",
                  p === currentPage
                    ? "bg-indigo-600 text-white"
                    : "bg-white/60 dark:bg-slate-800/60 hover:bg-white/80"
                )}
              >
                {p}
              </a>
            </span>
          ))}
        <a
          href={`?page=${Math.min(currentPage + 1, totalPages)}${search ? `&search=${search}` : ""}`}
          className={cn(
            "px-3 py-1 rounded-full border border-white/20 backdrop-blur",
            currentPage === totalPages ? "opacity-50 pointer-events-none" : "hover:bg-white/60"
          )}
        >
          Next
        </a>
      </div>
    </div>
  );
}
