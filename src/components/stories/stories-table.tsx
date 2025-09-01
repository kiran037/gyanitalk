import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui-elements/table";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { deleteStories, getStories } from "./fetch";
import { isValidImageUrl } from "../functions";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export async function StoriesTable({
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
  const { data, astrologers, totalPages, currentPage } = await getStories({
    page,
    limit,
    search,
    startDate,
    endDate,
  });

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      //setLoading(true);
      try {
        await deleteStories(id);
        toast.success("Coupon deleted");
        //await fetchCoupons();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete coupon");
      } finally {
        //setLoading(false);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[120px]">PROFILE</TableHead>
            <TableHead className="min-w-[120px]">NAME</TableHead>
            <TableHead className="min-w-[120px]">MEDIATYPE</TableHead>
            <TableHead className="min-w-[120px]">MEDIA</TableHead>
            <TableHead className="min-w-[120px]">VIEWS</TableHead>
            <TableHead className="min-w-[130px]">CREATED AT</TableHead>
            <TableHead className="min-w-[120px]">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: any, index: number) => {
            const astrologer_data = astrologers.find((a: any) => a.id === item.astrologerId); // ✅ Match feedback with user

            return (
              <TableRow
                key={index}
                className="hover:bg-muted/30 dark:hover:bg-/10 transition-hover border-[#eee] dark:border-dark-3"
              >
                {/* Profile Image*/}
                <TableCell>
                  <div className="flex items-center gap-3">
                      {astrologer_data?.profileImage && isValidImageUrl(astrologer_data.profileImage) ? (
                        <Image
                          src={isValidImageUrl(astrologer_data?.profileImage)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${astrologer_data.profileImage}`
                        : "https://gyanitalk.com/build/assets/images/person.png"} 
                          className="rounded-full object-cover"
                          width={40}
                          height={40}
                          alt={(astrologer_data.name || "astrologer") + " Logo"}
                        />
                      ) : (
                        <span className="text-dark dark:text-white font-medium truncate">
                          {astrologer_data.name || "-"}
                        </span>
                      )}
                    </div>
                </TableCell>

                {/* Astrologer Name */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="text-dark dark:text-white font-medium truncate">
                      {astrologer_data?.name || "-"}
                    </span>
                  </div>
                </TableCell>

                {/* Media Type*/}
                <TableCell>
                  <span className="text-dark dark:text-white text-sm">
                    {item?.mediaType || "-"}
                  </span>
                </TableCell>

                {/* Media */}
                <TableCell>
                  <div className="text-dark dark:text-white text-sm">
                    {item.mediaType === "image" && item.media && (
                      <Image
                        src={isValidImageUrl(item?.media)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${item.media}`
                        : "https://gyanitalk.com/build/assets/images/person.png"} 
                          className="rounded-full object-cover"
                          width={40}
                          height={40}
                          alt={(item.name || "Story Image") + " Logo"}
                      />
                    )}

                    {item.mediaType === "video" && item.media && (
                      <video
                        src={isValidImageUrl(item?.media)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${item.media}`
                        : "https://gyanitalk.com/build/assets/images/person.png"}
                        controls
                        width={150}
                        height={100}
                        className="rounded-md"
                      />
                    )}

                    {item.mediaType === "text" && item.media && (
                      <span className="text-dark dark:text-white text-sm">
                        {item.media}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Story View Count */}
                <TableCell>
                  <span className="text-dark dark:text-white text-sm">
                     {item.StoryViewCount  || "0"} {/* ✅ show count */}
                  </span>
                </TableCell>

                {/* Stories Date */}
                <TableCell>
                  <span className="text-dark dark:text-white text-sm">
                    {item.created_at
                      ? dayjs(item.created_at).format("DD MMM YYYY")
                      : "-"}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-dark dark:text-white text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        // onClick={() => //handleDelete(item.id)}
                        className="hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-300"
                        title="Delete Coupon"
                        //disabled={loading}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
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
