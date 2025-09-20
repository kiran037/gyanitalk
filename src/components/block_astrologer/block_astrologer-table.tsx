"use client";

import { useState } from "react";
import Image from "next/image";
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
import { isValidImageUrl } from "../functions";

interface Review {
  id: number;
  profile: string;
  userName?: string;
  contactNo: string;
  astrologerName: string;
  astrologerContactNo: string;
  created_at: string;
  reason: string;
}

interface BlockAstrologerTableProps {
  reviews: Review[];       // ✅ Array
  totalPages: number;
  currentPage: number;
  page: number;
  search: string;
}

export default function BlockAstrologerTable({ 
  reviews,
  totalPages,
  currentPage,
  page,
  search,
}: BlockAstrologerTableProps) {

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">USERPROFILE</TableHead>
            <TableHead className="text-center">USERNAME</TableHead>
            <TableHead className="text-center">ASTROLOGER</TableHead>
            <TableHead className="text-center">DATE</TableHead>
            <TableHead className="text-center">REASON</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reviews.map((item: any) => (
            <TableRow key={item.id}>

              {/* User Image */}
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
                    alt="Astrologer Image"
                  />
                  <span className="text-dark dark:text-white font-medium truncate">
                    {item.userName || "-"}
                  </span>
                </div>
              </TableCell>

              {/* User Info */}
              <TableCell className="text-center font-medium">
                {item.userName ? item.userName : "user"} -{" "}
                {item.contactNo}
              </TableCell>

              {/* Astrologer Info */}
              <TableCell className="text-center">
                {item.astrologerName} - {item.astrologerContactNo}
              </TableCell>

              {/* Created Date */}
                <TableCell className="text-center">
                  {item.created_at
                  ? moment(item.created_at).utcOffset("+05:30").format("DD MMM YYYY, hh:mm A")
                  : "-"}
              </TableCell>

              {/* Reason */}
              <TableCell className="text-center">
                {item.reason}
              </TableCell>

            </TableRow>
          ))}

          {/* Empty State */}
          {reviews.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="text-center py-6 text-gray-500">
                  🚫 No Block Astrologer found
                </div>
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