"use client";

import { useState, useEffect } from "react";
import { Clock, Film } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import StoriesTable from "@/components/extras/StoriesTable";
import { ActionModal } from "@/components/adminUI/ActionModal";

interface Story {
  id: number;
  astrologerId: string | null;
  mediaType: string | null;
  media: string | null;
  created_at: string;
  astrologer: {
    id: string;
    name: string;
    profileImage: string | null;
  } | null;
  viewCount: number;
  expiresAt: string;
  remainingTime: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  };
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; storyId: number | null }>({
    isOpen: false,
    storyId: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const addToast = useToast();

  useEffect(() => {
    fetchStories();
  }, [page]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      const res = await fetch(`/api/extras/stories?${params}`);
      const data = await res.json();

      if (data.success) {
        setStories(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch stories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.storyId) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/extras/stories/${deleteModal.storyId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        addToast("success", "Success", "Story deleted successfully");
        fetchStories();
        setDeleteModal({ isOpen: false, storyId: null });
      } else {
        addToast("error", "Error", data.error || "Failed to delete story");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete story");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Astrologer Stories"
          subtitle="View and manage astrologer stories (24-hour auto-expiry)"
          badge={{ text: "EXTRAS", variant: "purple" }}
          actions={
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Last 24 Hours</span>
            </div>
          }
        />

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Film className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Auto-Expiring Stories
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Stories automatically expire 24 hours after upload. Only active stories from the last 24 hours are shown here.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Stories</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{total}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchStories}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <StoriesTable
          stories={stories}
          loading={loading}
          onDelete={(id) => setDeleteModal({ isOpen: true, storyId: id })}
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
        onClose={() => setDeleteModal({ isOpen: false, storyId: null })}
        onConfirm={handleDelete}
        title="Delete Story"
        message="Are you sure you want to delete this story? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}