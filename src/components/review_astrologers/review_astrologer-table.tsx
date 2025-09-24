"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { isValidImageUrl } from "../functions";
import { deleteReview, getReviews } from "./fetch";
import moment from "moment";
import { Trash2 } from "lucide-react";

interface Review {
  id: number;
  review: string;
  created_at: string;
  userName: string;
  userProfile: string | null;
  userContactNo: string;
  astrologerName: string;
  astrologerContactNo: string;
}

interface ReviewAstrologerTableProps {
  reviews: Review[];
  totalPages: number;
  currentPage: number;
  page: number;
  search: string;
}

export default function ReviewAstrologerTable({
  reviews,
  totalPages,
  currentPage,
  page,
  search,
}: ReviewAstrologerTableProps) {

  // Delete modal
  const [showModal, setShowModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [Reviews, setReviews] = useState<Review[]>([]);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);

  // Fetch gifts
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getReviews({ page: currentPage, limit: 15, search });
      setReviews(res.reviews || []);
    } catch (error) {
      console.error("Failed to fetch review", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage, search]);

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">USERPROFILE</TableHead>
            <TableHead className="text-center">USERNAME</TableHead>
            <TableHead className="text-center">ASTROLOGER</TableHead>
            <TableHead className="text-center">DATE</TableHead>
            <TableHead className="text-center">Review</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Reviews.map((item) => (
            <TableRow key={item.id}>

              {/* Profile Image */}
              <TableCell>
                <div className="flex items-center justify-center gap-3">
                  <Image
                    src={
                      isValidImageUrl(item?.userProfile)
                        ? `${process.env.NEXT_PUBLIC_BASEURL}${item.userProfile}`
                        : "https://gyanitalk.com/build/assets/images/person.png"
                    }
                    className="rounded-full object-cover"
                    width={40}
                    height={40}
                    alt="Review Image"
                  />
                  {/* <span className="text-dark dark:text-white font-medium truncate">
                    {item.name || "-"}
                  </span> */}
                </div>
              </TableCell>

              {/* User Name or ContactNo*/}
              <TableCell className="text-center font-medium"> 
                {item.userName ? item.userName : "user"} -{" "}
                {item.userContactNo}
              </TableCell>

              {/* Astrologer Name or ContactNo*/}
              <TableCell className="text-center">
                {item.astrologerName} - {item.astrologerContactNo}
              </TableCell>

              {/* Created At Date */}
              <TableCell className="text-center">
                {item.created_at
                  ? moment(item.created_at).format("DD MMM YYYY, hh:mm A")
                  : "-"}
              </TableCell>

               {/* Review */}
              <TableCell className="text-center">
                {item.review}
              </TableCell>

              {/* Status */}
              <TableCell className="text-center">
                <div className="flex justify-center items-center">  
                  <button
                     onClick={() => {
                      setSelectedReviewId(item.id);
                      setShowModal(true);
                    }}
                    className="flex items-center text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="editbtn w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Empty State */}
          {Reviews.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="text-center py-6 text-gray-500">
                  🚫 No Reviews found
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

      {/* Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Delete Review
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to delete this review? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                        if (selectedReviewId) {
                          const result = await deleteReview(selectedReviewId);
                          if (result.success) {
                            toast.success("Review deleted successfully!");
                            fetchReviews();
                          } else {
                            toast.error("Failed to delete");
                          }
                          setShowModal(false);
                          setSelectedReviewId(null);
                        }
                      }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}