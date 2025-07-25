import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { getPaymentTransactions, getWalletTransactions } from "./fetch";
import moment from "moment";
import { isValidImageUrl } from "../functions";

export async function PaymentTransactionsTable({
  page = 1,
  limit = 15,
  search = "",
  startDate,
  endDate,
}: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;

}) {
  const { records, totalPages, currentPage } = await getPaymentTransactions({
    page,
    limit,
    search,
    startDate,
    endDate,
  });

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#f9fafb] dark:bg-dark-2">
            <TableHead className="min-w-[250px]">User</TableHead>
            <TableHead className="min-w-[220px]">Payment Summary</TableHead>
            <TableHead className="min-w-[100px] text-center">Cashback</TableHead>
            <TableHead className="min-w-[110px] text-center">Status</TableHead>
            <TableHead className="min-w-[180px] text-right">Date & Time</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((item: any, index: number) => (
            <TableRow
              key={index}
              className="hover:bg-muted/20 dark:hover:bg-muted/5 transition-colors border-b border-gray-200 dark:border-dark-3"
            >
              {/* User Info */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      isValidImageUrl(item?.user?.profile)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${item?.user?.profile}`
                        : "https://gyanitalk.com/build/assets/images/person.png"
                    }
                    alt={item?.user?.name || "User"}
                    width={42}
                    height={42}
                    className="rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white capitalize">
                      {item?.user?.name?.trim() || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      #{item?.id}
                    </div>
                  </div>
                </div>
              </TableCell>

              {/* Payment Summary */}
              <TableCell>
                <div className="text-sm text-gray-900 dark:text-white font-medium">
                  ₹{Number(item.amount).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.paymentMode || "N/A"}{" "}
                  {item.paymentReference && `· Ref: ${item.paymentReference}`}
                </div>
              </TableCell>

              {/* Cashback */}
              <TableCell className="text-center">
                <span className="text-green-600 font-semibold text-sm dark:text-green-400">
                  ₹{Number(item.cashback_amount || 0).toFixed(2)}
                </span>
              </TableCell>

              {/* Payment Status */}
              <TableCell className="text-center">
                <span
                  className={cn(
                    "inline-block px-2 py-1 text-xs font-semibold rounded-md",
                    item.paymentStatus === "success"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : item.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  )}
                >
                  {item.paymentStatus || "N/A"}
                </span>
              </TableCell>

              {/* Date */}
              <TableCell className="text-right">
                <span className="text-sm text-gray-800 dark:text-white">
                  {item.created_at
                    ? moment(item.created_at)
                      .utcOffset("+05:30")
                      .format("DD MMM YYYY, hh:mm A")
                    : "-"}
                </span>
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
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`}
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
