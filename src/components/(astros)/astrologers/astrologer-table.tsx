
import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import {
  UserIcon,
  UserCircle2Icon,
  WifiIcon,
  WifiOffIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import { cn } from "@/lib/utils";
import { getAstrologers } from "./fetch";
import { PreviewIcon } from "./icons";
import { LiveStatusToggle } from "./LiveStatusToggle";
import { VerifyStatusToggle } from "./VerifiedToggle";
import Link from "next/link";


export async function AstrologerTable({
  page = 1,
  limit = 15,
  search = "",
  sortBy = "",
  sortOrder = "asc",
  isVerifiedKey,
}: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isVerifiedKey?: string;
}) {
  const { astrologers, totalPages, currentPage } = await getAstrologers({
    page,
    limit,
    search,
    sortBy,
    sortOrder: sortBy === "isVerified" ? "" : sortOrder,
    isVerifiedKey,
  });

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[180px]">Name</TableHead>
            <TableHead className="min-w-[140px]">Live Mode</TableHead>
            <TableHead className="min-w-[140px]">Contact</TableHead>
            <TableHead className="min-w-[130px]">Gender</TableHead>
            <TableHead className="min-w-[110px]">Total Req.</TableHead>
            <TableHead className="min-w-[110px]">Live</TableHead>
            <TableHead className="cursor-pointer">
              <a
                href={`?page=${page}&search=${search}&sortBy=chatStatus&sortOrder=${sortBy === "chatStatus" && sortOrder === "asc" ? "desc" : "asc"
                  }`}
                className="flex items-center gap-1"
              >
                Chat
                {sortBy === "chatStatus" && (sortOrder === "asc" ? "▲" : "▼")}
              </a>
            </TableHead>


            <TableHead className="cursor-pointer">
              <a
                href={`?page=${page}&search=${search}&sortBy=callStatus&sortOrder=${sortBy === "callStatus" && sortOrder === "asc" ? "desc" : "asc"
                  }`}
                className="flex items-center gap-1"
              >
                Call
                {sortBy === "callStatus" && (sortOrder === "asc" ? "▲" : "▼")}
              </a>
            </TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="min-w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {astrologers.map((item, index) => (
            <TableRow
              key={index}
              className="border-b border-gray-100 dark:border-dark-3 hover:bg-muted/30 dark:hover:bg-muted/10 transition"
            >
              <TableCell>
                <Link
                  href={`/astrologers/${item.id}`}
                  className="flex items-center gap-4 hover:underline"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-md bg-gray-100">
                    <Image
                      src={
                        item.profileImage
                          ? `${process.env.NEXT_PUBLIC_BASEURL}${item.profileImage}`
                          : "https://gyanitalk.com/build/assets/images/person.png"
                      }
                      alt={`${item.name || "User"} Logo`}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {item.name || "-"}
                  </span>
                </Link>
              </TableCell>

              <TableCell>
                <LiveStatusToggle
                  id={item.id}
                  isLiveOff={item.isLiveOff === 0}
                />
              </TableCell>


              <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                {item.contactNo || "-"}
              </TableCell>
              <TableCell className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                {item.gender === "Male" ? (
                  <><UserIcon className="w-4 h-4 text-blue-500" /><span>Male</span></>
                ) : item.gender === "Female" ? (
                  <><UserCircle2Icon className="w-4 h-4 text-pink-500" /><span>Female</span></>
                ) : (
                  <><UserCircle2Icon className="w-4 h-4 text-purple-500" /><span>{item.gender || "Other"}</span></>
                )}
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                {item.totalCallRequest || "0"} / {item.totalChatRequest || "0"}
              </TableCell>
              <TableCell>
                {item.livekey === "Online" ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <WifiIcon className="w-4 h-4" /> Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-red-500 dark:text-red-400">
                    <WifiOffIcon className="w-4 h-4" /> Offline
                  </span>
                )}
              </TableCell>
              <TableCell>
                {item.chatStatus === "Online" ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <WifiIcon className="w-4 h-4" /> Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-red-500 dark:text-red-400">
                    <WifiOffIcon className="w-4 h-4" /> Offline
                  </span>
                )}
              </TableCell>
              <TableCell>
                {item.callStatus === "Online" ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <WifiIcon className="w-4 h-4" /> Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-red-500 dark:text-red-400">
                    <WifiOffIcon className="w-4 h-4" /> Offline
                  </span>
                )}
              </TableCell>
              <TableCell>
                <VerifyStatusToggle id={item.id} isVerified={item.isVerified} />
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <Link
                    href={`/astrologers/${item.id}`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title="Preview"
                  >
                    <PreviewIcon />
                  </Link>
                  <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 transition" title="Delete">
                    <TrashIcon />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}${sortBy ? `&sortBy=${sortBy}` : ""}${sortOrder ? `&sortOrder=${sortOrder}` : ""}`}
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
