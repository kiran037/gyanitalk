"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import { ChevronDown, Download } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getOrders, changeOrderStatus } from "./fetch";
import toast from "react-hot-toast";
import moment from "moment";
import { isValidImageUrl } from "../functions";

type Order = {
  id: number;
  payableAmount: number;
  gstAmount: number;
  gstPercent?: number;
  orderStatus: string;
  created_at: string;
  user: {
    name: string;
    profile?: string | null;
    contactNo: string;
    email: string;
  };
  product: {
    name: string;
    productImage?: string | null;
    product_category?: {
      name: string;
    };
  };
  order_address?: {
    name: string;
    phoneNumber: string;
    flatNo: string;
    locality: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
};

export function OrderTable({
  orders,
  totalPages,
  currentPage,
  page,
  search,
}: {
  orders: Order[];
  totalPages: number;
  currentPage: number;
  page: number;
  search: string;
}) {

  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const updateOrderStatus = (id: number, status: string) => {
    startTransition(async () => {
      const res = await changeOrderStatus(id, status);

      if (res.success) {
        toast.success(`Order status updated to ${status}`);
        setDropdownOpen(null); // close dropdown
        router.refresh(); // refresh server component
      } else {
        toast.error("Failed to update order status");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-center">Amount</TableHead>
            <TableHead className="text-center">GST</TableHead>
            <TableHead className="text-center">Order Date</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Address</TableHead>
            <TableHead className="text-center">Change Status</TableHead>
            <TableHead className="text-right">Invoice</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.map((item) => (
            <TableRow key={item.id}>
              {/* User */}
              <TableCell>{item.user?.name || "User"}</TableCell>

              {/* Product */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      isValidImageUrl(item?.product?.productImage)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${item.product.productImage}`
                        : "https://gyanitalk.com/build/assets/images/person.png"
                    }
                    alt={item.product?.name || "Product"}
                    width={42}
                    height={42}
                    className="rounded-full object-cover border"
                  />
                  <div>
                    {item.product?.name} (
                    {item.product?.product_category?.name})
                  </div>
                </div>
              </TableCell>

              {/* Amount */}
              <TableCell className="text-center">
                ₹{Number(item.payableAmount).toFixed(2)}
              </TableCell>

              {/* GST */}
              <TableCell className="text-center">
                ₹{Number(item.gstAmount).toFixed(2)}
              </TableCell>

              {/* Date */}
              <TableCell className="text-center">
                {item.created_at
                  ? moment(item.created_at).format("DD MMM YYYY, hh:mm A")
                  : "-"}
              </TableCell>

              {/* Status */}
              <TableCell className="text-center">
                <span
                  className={cn(
                    "px-2 py-1 rounded text-xs font-semibold",
                    item.orderStatus === "Confirmed"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  )}
                >
                  {item.orderStatus}
                </span>
              </TableCell>

              {/* Address */}
              <TableCell className="text-center">
                {item.order_address
                  ? `${item.order_address.flatNo}, ${item.order_address.city}, ${item.order_address.state} - ${item.order_address.pincode}`
                  : "N/A"}
              </TableCell>

              {/* Dropdown for status change */}
              <TableCell className="text-center">
                {item.orderStatus !== "Cancelled" && (
                  <div className="relative inline-block">
                    <button
                      onClick={() =>
                        setDropdownOpen(
                          dropdownOpen === item.id ? null : item.id
                        )
                      }
                      className="flex items-center px-2 py-1 border rounded"
                    >
                      {item.orderStatus}
                      <ChevronDown className="ml-1 w-4 h-4" />
                    </button>

                    {dropdownOpen === item.id && (
                      <div className="absolute mt-1 w-40 bg-white border rounded shadow-lg z-10">
                        {["Confirmed", "Packed", "Dispatched", "Delivered"].map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(item.id, status)}
                              className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                              disabled={isPending}
                            >
                              {status}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </TableCell>

              {/* Invoice */}
              <TableCell className="text-right">
                <Link
                  href={`/orders/invoice_order/${item.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Invoice
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="mt-6 flex justify-end gap-2 flex-wrap text-sm">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          const isLast = pageNum === totalPages;
          const isCurrent = pageNum === currentPage;
          const shouldShow =
            pageNum <= 3 ||
            pageNum === totalPages ||
            pageNum === currentPage ||
            pageNum === currentPage - 1 ||
            pageNum === currentPage + 1;

          if (!shouldShow) {
            if (
              pageNum === currentPage - 2 ||
              pageNum === currentPage + 2
            ) {
              return <span key={i}>...</span>;
            }
            return null;
          }

          return (
            <a
              key={i}
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}`}
              className={cn(
                "px-3 py-1 border rounded",
                isCurrent
                  ? "bg-primary text-white"
                  : "bg-white text-black dark:bg-dark dark:text-white"
              )}
            >
              {isLast ? "Last" : pageNum}
            </a>
          );
        })}
      </div>
    </div>
  );
}
