import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { getCustomers } from "./fetch";
import { DownloadIcon, PreviewIcon } from "./icons";

export async function CustomerTable({ page = 1, limit = 15, search = "" }: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { data, totalPages, currentPage } = await getCustomers({ page, limit, search });
  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[155px] xl:pl-7.5">Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead>TOB</TableHead>
            <TableHead className="text-right xl:pr-7.5">Referred</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="border-[#eee] dark:border-dark-3">
              <TableCell className="min-w-fit">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      item.profile
                        ? `${process.env.BASEURL}${item.profile}`
                        : "https://gyanitalk.com/build/assets/images/person.png"
                    }
                    className="size-8 rounded-full object-cover"
                    width={40}
                    height={40}
                    alt={(item.name || "User") + " Logo"}
                  />
                  <div className="text-dark dark:text-white">
                    {item.name || "-"}
                  </div>
                </div>
              </TableCell>


              <TableCell className="min-w-[155px] xl:pl-7.5">
                <h5 className="text-dark dark:text-white">{item.contactNo}</h5>
              </TableCell>



              <TableCell>
                <p className="text-dark dark:text-white">
                  {item.birthDate
                    ? dayjs(item.birthDate).format("MMM DD, YYYY")
                    : "-"}
                </p>
              </TableCell>

              <TableCell>
                <p className="text-dark dark:text-white">
                  {item.birthTime
                    ? item.birthTime
                    : "-"}
                </p>
              </TableCell>


              <TableCell>
                <p className="text-dark dark:text-white">
                  {item.created_at
                    ? dayjs(item.created_at).format("MMM DD, YYYY")
                    : "-"}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-dark dark:text-white">
                  {item.created_at
                    ? dayjs(item.created_at).format("MMM DD, YYYY")
                    : "-"}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-dark dark:text-white">
                  {item.created_at
                    ? dayjs(item.created_at).format("MMM DD, YYYY")
                    : "-"}
                </p>
              </TableCell>


              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-end gap-x-3.5">
                  <button className="hover:text-primary">
                    <span className="sr-only">View Invoice</span>
                    <PreviewIcon />
                  </button>
                  <button className="hover:text-primary">
                    <span className="sr-only">Delete Invoice</span>
                    <TrashIcon />
                  </button>

                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination UI */}
      <div className="mt-6 flex justify-end gap-2">
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
              href={`?page=${pageNum}`}
              className={cn(
                "px-3 py-1 border rounded text-sm",
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
