"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import { Button } from "@/components/ui/button";
import moment from "moment";
import Link from "next/link";
import { deleteCoupon, getCoupons } from "./fetch";
import toast from "react-hot-toast";

export function CouponsTable() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCoupons = async () => {
    const { records } = await getCoupons();
    setCoupons(records);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      setLoading(true);
      try {
        await deleteCoupon(id);
        toast.success("Coupon deleted");
        await fetchCoupons();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete coupon");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4 sm:p-6 overflow-x-auto">

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Available Coupons
        </h2>
        <Link
          href="/coupons/create"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Create New Coupon
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-[#F9FAFB] dark:bg-gray-800 [&>th]:text-gray-600 dark:[&>th]:text-gray-300 text-sm">
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Min Order</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {coupons.map((item: any) => (
            <TableRow
              key={item.id}
              className="hover:bg-muted/40 dark:hover:bg-muted/10 transition-all border-b dark:border-gray-700"
            >
              <TableCell className="font-semibold text-gray-900 dark:text-white">
                {item.code}
              </TableCell>

              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === "coupon"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                >
                  {item.type}
                </span>
              </TableCell>

              <TableCell className="text-sm text-gray-700 dark:text-gray-200">
                ₹{item.discount_value}
              </TableCell>

              <TableCell className="text-sm text-gray-700 dark:text-gray-200">
                ₹{item.min_order_amount}
              </TableCell>

              <TableCell className="text-sm text-gray-700 dark:text-gray-200">
                {item.usage_limit} / {item.usage_limit_per_user}
              </TableCell>

              <TableCell className="text-sm text-gray-700 dark:text-gray-200">
                {moment(item.start_date).format("DD MMM")} -{" "}
                {moment(item.expiry_date).format("DD MMM")}
              </TableCell>

              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${item.is_active
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </TableCell>

              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Link href={`coupons/edit/${item.id}`}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300"
                      title="Edit Coupon"
                    >
                      <Pencil size={16} />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-300"
                    title="Delete Coupon"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
