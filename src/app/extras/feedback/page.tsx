"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { useToast } from "@/components/Toast/ToastProvider";
import FeedbackTable from "@/components/extras/FeedbackTable";
import { ActionModal } from "@/components/adminUI/ActionModal";

interface Feedback {
  id: string;
  userId: string;
  review: string;
  isActive: boolean;
  appId: number;
  created_at: string;
  users: {
    id: string;
    name: string | null;
    email: string | null;
    contactNo: string | null;
    profile: string | null;
  };
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; feedbackId: string | null }>({
    isOpen: false,
    feedbackId: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const addToast = useToast();

  useEffect(() => {
    fetchFeedbacks();
  }, [page, search, activeFilter]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(activeFilter && { isActive: activeFilter }),
      });

      const res = await fetch(`/api/extras/feedback?${params}`);
      const data = await res.json();

      if (data.success) {
        setFeedbacks(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.feedbackId) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/extras/feedback/${deleteModal.feedbackId}?modifiedBy=1`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        addToast("success", "Success", "Feedback deleted successfully");
        fetchFeedbacks();
        setDeleteModal({ isOpen: false, feedbackId: null });
      } else {
        addToast("error", "Error", data.error || "Failed to delete feedback");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete feedback");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (feedbackId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/extras/feedback/${feedbackId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !currentStatus,
          modifiedBy: 1,
        }),
      });

      const data = await res.json();

      if (data.success) {
        addToast("success", "Success", "Status updated successfully");
        fetchFeedbacks();
      } else {
        addToast("error", "Error", data.error || "Failed to update status");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="App Feedback"
          subtitle="View and manage user feedback and reviews"
          badge={{ text: "EXTRAS", variant: "purple" }}
        />

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search feedback by text..."
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">{total}</span> total
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <FeedbackTable
          feedbacks={feedbacks}
          loading={loading}
          onDelete={(id) => setDeleteModal({ isOpen: true, feedbackId: id })}
          onToggleActive={handleToggleActive}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "primary" : "outline"}
                    onClick={() => setPage(pageNum)}
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ActionModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, feedbackId: null })}
        onConfirm={handleDelete}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}