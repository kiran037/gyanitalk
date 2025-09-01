import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui-elements/table";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { getFeedbacks } from "./fetch";
import { isValidImageUrl } from "../functions";

export async function FeedbackTable({
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
  const { data, users, totalPages, currentPage } = await getFeedbacks({
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
            <TableHead className="min-w-[120px]">PROFILE</TableHead>
            <TableHead className="min-w-[120px]">User</TableHead>
            <TableHead className="min-w-[130px]">App</TableHead>
            <TableHead className="min-w-[160px]">Feedback Date</TableHead>
            <TableHead className="min-w-[180px]">Feedback</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: any, index: number) => {
            const review = users.find((u: any) => u.id === item.userId); // ✅ Match feedback with user

            return (
              <TableRow
                key={index}
                className="hover:bg-muted/30 dark:hover:bg-/10 transition-hover border-[#eee] dark:border-dark-3"
              >
                {/* Profile */}
                <TableCell>
                  <div className="flex items-center gap-3">
                      {review?.profile && isValidImageUrl(review.profile) ? (
                        <Image
                          src={isValidImageUrl(review?.profile)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${review.profile}`
                        : "https://gyanitalk.com/build/assets/images/person.png"} 
                          className="rounded-full object-cover"
                          width={40}
                          height={40}
                          alt={(review.name || "User") + " Logo"}
                        />
                      ) : (
                        <span className="text-dark dark:text-white font-medium truncate">
                          {review.name || "-"}
                        </span>
                      )}
                    </div>
                </TableCell>

                {/* User */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="text-dark dark:text-white font-medium truncate">
                      {review?.name || "-"},{" "}
                      {review?.contactNo || "-"}
                    </span>
                  </div>
                </TableCell>

                {/* App Id */}
                <TableCell>
                  <span className="text-dark dark:text-white text-sm">
                    {item.appId === 1 ? "Customer App" : "Partner App"}
                  </span>
                </TableCell>

                {/* Feedback Date */}
                <TableCell>
                  <span className="text-dark dark:text-white text-sm">
                    {item.created_at
                      ? dayjs(item.created_at).format("DD MMM YYYY")
                      : "-"}
                  </span>
                </TableCell>

                {/* Feedback */}
                <TableCell>
                  <span className="text-dark dark:text-white text-sm">
                    {item.review || "-"}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
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
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}${
                startDate ? `&startDate=${startDate}` : ""
              }${endDate ? `&endDate=${endDate}` : ""}`}
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
