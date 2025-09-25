"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import moment from "moment";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { manualtransactionapprove} from "./fetch";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface PaymentManual {
  id: number;
  userId: number;
  amount: number;
  paymentMode: string;
  paymentReference: string | null;
  paymentStatus: string;
  created_at: string | null;
  user?: {
    name: string | null;
    contactNo: string | null;
  };
  updated_at: string | null;
}

interface Props {
  payment_manual: PaymentManual[];
  totalPages: number;
  currentPage: number;
  page: number;
  search: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export default function ManualTable({ payment_manual: initialRequests,
  totalPages,
  currentPage,
  page,
  search,
  status,
  startDate,
  endDate,
}: Props) {

   // Local state for withdrawalreq
  const [paymentmanual, setpaymentmanual] = useState<PaymentManual[]>(initialRequests);

  // ✅ Status Change Function
  const onStatusChange = async (id: number, newStatus: "success" | "failed") => {
    try {
      const data = await manualtransactionapprove({ id, status: newStatus });

      if (data.success) {
        toast.success(`Payment #${id} marked as ${newStatus}`);
        setpaymentmanual((prev) =>
          prev.map((t) => (t.id === id ? { ...t, paymentStatus: newStatus } : t))
        );
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err.message || "Request failed");
    }
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NAME</TableHead>
            <TableHead className="text-center">CONTACT NO.</TableHead>
            <TableHead className="text-center">Amount</TableHead>
            <TableHead className="text-center">SOURCE</TableHead>
            <TableHead className="text-center">TRANSACTION ID</TableHead>
            <TableHead className="text-center">STATUS</TableHead>
            <TableHead className="text-center">CREATE DATE</TableHead>
            <TableHead className="text-center">ACTION</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paymentmanual.map((item) => (
            <TableRow key={item.id}>

              {/* Profile Image */}
              <TableCell>
                  <div className="font-medium whitespace-nowrap">
                    <Link
                      href={`/customers/${item.userId}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {item.user?.name || "--"}
                    </Link>
                  </div>
              </TableCell>

              {/* Name + Contact */}
              <TableCell>
                <Link
                  href={`/customers/${item.userId}`}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {item.user?.contactNo || "--"}
                </Link>
              </TableCell>

              {/* Withdraw Amount */}
              <TableCell className="text-center">{item.amount}</TableCell>

              {/* Withdraw Amount */}
              <TableCell className="text-center">{item.paymentMode}</TableCell>

              {/* Withdraw Amount */}
              <TableCell className="text-center">{item.paymentReference || "--"}</TableCell>

              {/* Withdraw Amount */}
              <TableCell className="text-center">{item.paymentStatus}</TableCell>

              {/* Created Date */}
              <TableCell className="text-center">
                {item.created_at
                ? moment(item.created_at).utcOffset("+05:30").format("DD MMM YYYY, hh:mm A")
                : "-"}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex gap-2 justify-center">
                  {item.paymentStatus === "pending" && (
                    <>
                      <button
                        onClick={() => onStatusChange(item.id, "success")}
                        className="flex items-center btn btn-success btn-sm text-white px-2 py-1 rounded-md bg-green-600 hover:bg-green-700"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" /> 
                      </button>
                      <button
                        onClick={() => onStatusChange(item.id, "failed")}
                        className="flex items-center btn btn-danger btn-sm text-white px-2 py-1 rounded-md bg-red-600 hover:bg-red-700"
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                      </button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Empty State */}
          {paymentmanual.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No manual payment found
              </TableCell>
            </TableRow>
          )}
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
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return <span key={i}>...</span>;
            }
            return null;
          }

          return (
            <a
              key={i}
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`}
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