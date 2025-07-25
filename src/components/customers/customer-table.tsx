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
import { getCustomers } from "./fetch";
import { DownloadIcon, PreviewIcon } from "./icons";
import moment from "moment";
import { isValidImageUrl } from "../functions";

export async function CustomerTable({
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
  const { data, totalPages, currentPage } = await getCustomers({
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
            <TableHead className="min-w-[180px]">Name</TableHead>
            <TableHead className="min-w-[140px]">Contact</TableHead>
            <TableHead className="min-w-[130px]">DOB</TableHead>
            <TableHead className="min-w-[110px]">TOB</TableHead>
            <TableHead className="text-right min-w-[110px]">Referred</TableHead>
            <TableHead className="min-w-[100px]">Balance</TableHead>
            <TableHead className="min-w-[160px]">Created</TableHead>
            <TableHead className="min-w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item: any, index: number) => (
            <TableRow key={index} className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors border-[#eee] dark:border-dark-3">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      isValidImageUrl(item?.profile)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${item.profile}`
                        : "https://gyanitalk.com/build/assets/images/person.png"
                    }
                    className="rounded-full object-cover"
                    width={40}
                    height={40}
                    alt={(item.name || "User") + " Logo"}
                  />
                  <span className="text-dark dark:text-white font-medium truncate">
                    {item.name || "-"}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <span className="text-dark dark:text-white text-sm">
                  {item.contactNo || "-"}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-dark dark:text-white text-sm">
                  {item.birthDate
                    ? dayjs(item.birthDate).format("DD MMM YYYY")
                    : "-"}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-dark dark:text-white text-sm">
                  {item.birthTime || "-"}
                </span>
              </TableCell>

              <TableCell className="text-right">
                <span className="text-dark dark:text-white text-sm">
                  {item.created_at
                    ? dayjs(item.created_at).format("DD MMM YYYY")
                    : "-"}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-dark dark:text-white font-semibold text-sm">
                  ₹{Number(item.balance || 0).toFixed(2)}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-dark dark:text-white text-sm">
                  {item.created_at
                    ? moment(item.created_at).utcOffset("+05:30").format("DD MMM YYYY, hh:mm A")
                    : "-"}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <button className="text-muted hover:text-primary transition-colors">
                    <span className="sr-only">View</span>
                    <PreviewIcon />
                  </button>
                  <button className="text-red-500 hover:text-red-600 transition-colors">
                    <span className="sr-only">Delete</span>
                    <TrashIcon />
                  </button>
                </div>
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
