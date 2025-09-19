"use client";

import { useState } from "react";
import Image from "next/image";
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
import { isValidImageUrl } from "../functions";
import { releaseWithdrawal, rejectWithdrawal } from "./fetch";
import { Share } from "lucide-react";

type WithdrawRequests = {
  id: number;
  profileImage?: string;
  name: string;
  contactNo: string;
  withdrawAmount: number;
  method_id?: number;
  method_name?: string;
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
};

interface Props {
  withdrawlRequests: WithdrawRequests[];
  totalPages: number;
  currentPage: number;
  page: number;
  search: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export default function WithdrawalRequestsTable({ withdrawlRequests: initialRequests,
  totalPages,
  currentPage,
  page,
  search,
  status,
  startDate,
  endDate,
}: Props) {

   // Local state for withdrawalreq
  const [withdrawalreq, setWithdrawalsreq] = useState<WithdrawRequests[]>(initialRequests);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Functions Release Modal
  function openReleaseModal(id: number) {
    setSelectedId(id);
    setReleaseModalOpen(true);
  }

  // Functions Reject Modal
  function openRejectModal(id: number) {
    setSelectedId(id);
    setRejectModalOpen(true);
  }

  // Withdrawal Request ✅ Confirm Release
  async function confirmRelease() {
    if (!selectedId) return;
    const res = await releaseWithdrawal(selectedId);
    if (res.success) {
      toast.success(`Released request #${selectedId}`);
      setWithdrawalsreq((prev) =>
        prev.map((t) =>
          t.id === selectedId ? { ...t, status: "Released" } : t
        )
      );
    } else {
      toast.error(res.error || "Something went wrong");
    }
  }

  // Withdrawal Request ❌ Confirm Reject
  async function confirmReject() {
    if (!selectedId) return;
    const res = await rejectWithdrawal(selectedId);
    if (res.success) {
      toast.success(`Reject request #${selectedId}`);
      setWithdrawalsreq((prev) =>
        prev.map((t) =>
          t.id === selectedId ? { ...t, status: "Reject" } : t
        )
      );
    } else {
      toast.error(res.error || "Something went wrong");
    }
  }

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Profile</TableHead>
            <TableHead className="text-center">NAME</TableHead>
            <TableHead className="text-center">Amount</TableHead>
            <TableHead className="text-center">Request Date</TableHead>
            <TableHead className="text-center">Payment Method</TableHead>
            <TableHead className="text-center">Detail</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {withdrawalreq.map((item) => (
            <TableRow key={item.id}>

              {/* Profile Image */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      isValidImageUrl(item?.profileImage)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${item.profileImage}`
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

              {/* Name + Contact */}
              <TableCell>{item.name} - {item.contactNo}</TableCell>

              {/* Withdraw Amount */}
              <TableCell className="text-center">{item.withdrawAmount}</TableCell>

              {/* Created Date */}
              <TableCell className="text-center">
                {item.created_at
                ? moment(item.created_at).utcOffset("+05:30").format("DD MMM YYYY, hh:mm A")
                : "-"}
              </TableCell>

              {/* Method Name */}
              <TableCell className="text-center">{item.method_name}</TableCell>

              {/* Payment Details */}
              <TableCell className="text-center">
                {item.method_id === 2 ? (
                  <>UPI: {item.upiId}</>
                ) : item.method_id === 3 ? (
                  <>--</>
                ) : (
                  <>
                    A/C NO: {item.accountNumber} <br />
                    IFSC: {item.ifscCode} <br />
                    A/C Holder: {item.accountHolderName}
                  </>
                )}
              </TableCell>

              {/* Status */}
              <TableCell className="text-center">
                <span
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    item.status === "Pending" && "bg-yellow-100 text-yellow-700",
                    item.status === "Released" && "bg-green-100 text-green-700",
                    item.status === "Reject" && "bg-red-100 text-red-700"
                  )}
                >
                  {item.status}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex justify-center items-center">
                  {item.status === "Pending" && (
                    <>
                    <button
                      onClick={() => openReleaseModal(item.id)}
                      className="text-blue-600 hover:underline p-4 text-center"
                    >
                      <Share className="w-4 h-4 mr-1 ml-3" /> Release
                    </button>
                    <button
                      onClick={() => openRejectModal(item.id)}
                      className="text-blue-600 hover:underline p-4 text-center"
                    >
                      <Share className="w-4 h-4 mr-1 ml-2" /> Reject
                    </button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Empty State */}
          {withdrawalreq.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No WithdrawlRequests found
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

      {/* ✅ Release Modal */}
        {releaseModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
              <div className="p-6 text-center">
                <h2 className="text-2xl font-semibold mb-2">Are you sure?</h2>
                <p className="text-slate-600 mb-6">
                  Do you really want to Release This Amount?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setReleaseModalOpen(false)}
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmRelease();
                      setReleaseModalOpen(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Release
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ✅ Reject Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
              <div className="p-6 text-center">
                <h2 className="text-2xl font-semibold mb-2">Are you sure?</h2>
                <p className="text-slate-600 mb-6">
                  Do you really want to Reject This Amount?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setRejectModalOpen(false)}
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmReject();
                      setRejectModalOpen(false);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}