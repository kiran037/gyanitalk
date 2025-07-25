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
import { getWalletTransactions } from "./fetch";
import moment from "moment";
import { isValidImageUrl } from "../functions";

export async function TransactionsTable({
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
  const { records, totalPages, currentPage } = await getWalletTransactions({
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
          <TableRow className="bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[200px]">User</TableHead>
            <TableHead className="min-w-[120px]">Type</TableHead>
            <TableHead className="min-w-[100px]">Amount</TableHead>
            <TableHead className="min-w-[130px]">Transaction</TableHead>
            <TableHead className="min-w-[160px]">Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((item: any, index: number) => (
            <TableRow
              key={index}
              className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors border-[#eee] dark:border-dark-3"
            >
              {/* User Profile + Name */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      isValidImageUrl(item?.user?.profile)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${item?.user?.profile}`
                        : "https://gyanitalk.com/build/assets/images/person.png"
                    }
                    className="rounded-full object-cover"
                    width={40}
                    height={40}
                    alt={item?.user?.name || "User"}
                  />
                  <span className="text-dark dark:text-white font-medium truncate">
                    {item?.user?.name || "-"}
                  </span>
                </div>
              </TableCell>

              {/* Credit / Debit */}
              <TableCell>
                <span
                  className={cn(
                    "px-2 py-1 text-sm rounded font-semibold",
                    item.isCredit
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  )}
                >
                  {item.isCredit ? "Credit" : "Debit"}
                </span>
              </TableCell>

              {/* Amount */}
              <TableCell>
                <span className="text-dark dark:text-white font-semibold text-sm">
                  ₹{Number(item.amount).toFixed(2)}
                </span>
              </TableCell>

              {/* Transaction Type */}
              <TableCell>
                <span className="text-dark dark:text-white text-sm capitalize">
                  {item.transactionType || "-"}
                </span>
              </TableCell>

              {/* Created At */}
              <TableCell>
                <span className="text-dark dark:text-white text-sm">
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
