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

type WalletHistory = {
  id: number;
  name: string;
  profile: string | null;
  contactNo: string;
  amount: number;
  created_at: string; // ISO date string
  paymentMode: string;
  paymentStatus: string;
};

type Props = {
  wallethistory: WalletHistory[];
  totalPages: number;
  currentPage: number;
  page: number;
  search: string;
};

export default function WalletHistoryTable({ 
  wallethistory,
  totalPages,
  currentPage,
  page,
  search }: Props) {

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Profile</TableHead>
            <TableHead className="text-center">NAME</TableHead>
            <TableHead className="text-center">ContactNo</TableHead>
            <TableHead className="text-center">Amount</TableHead>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Payment Method</TableHead>
            <TableHead className="text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {wallethistory.map((item) => (
            <TableRow key={item.id}>

              {/* Profile Image */}
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
                    {item.name || "-"}
                  </span>
                </div>
              </TableCell>

              {/* name */}
              <TableCell className="text-center font-medium">{item.name || "-"}</TableCell>

              {/* Contact */}
              <TableCell className="text-center">{item.contactNo}</TableCell>

              {/* Amount */}
              <TableCell className="text-center">{item.amount}</TableCell>

              {/* Created Date */}
                <TableCell className="text-center">
                  {item.created_at
                  ? moment(item.created_at).utcOffset("+05:30").format("DD MMM YYYY, hh:mm A")
                  : "-"}
              </TableCell>

              {/* Payment Mode */}
              <TableCell className="text-center"> {item.paymentMode ? item.paymentMode.charAt(0).toUpperCase() + item.paymentMode.slice(1) : "--"}
              </TableCell>

              {/* Status */}
              <TableCell className="text-center">
                <span
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    item.paymentStatus === "success" && "bg-green-100 text-green-600",
                    item.paymentStatus === "failed" && "bg-red-100 text-red-600",
                    // item.paymentStatus === "pending" && "bg-yellow-100 text-yellow-600"
                  )}
                >
                  {item.paymentStatus}
                </span>
              </TableCell>
            </TableRow>
          ))}

          {/* Empty State */}
          {wallethistory.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="text-center py-6 text-gray-500">
                  🚫 No Wallet History found
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