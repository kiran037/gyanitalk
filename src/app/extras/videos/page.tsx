"use client";

import { useState, useEffect } from "react";
import { Plus, Video } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { useToast } from "@/components/Toast/ToastProvider";
import VideosTable from "@/components/extras/VideosTable";
import VideoFormModal from "@/components/extras/VideoFormModal";
import { ActionModal } from "@/components/adminUI/ActionModal";

interface Video {
  id: string;
  youtubeLink: string;
  coverImage: string;
  videoTitle: string;
  isActive: boolean;
  created_at: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; videoId: string | null }>({
    isOpen: false,
    videoId: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const addToast = useToast();

  useEffect(() => {
    fetchVideos();
  }, [page, search]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const res = await fetch(`/api/extras/videos?${params}`);
      const data = await res.json();

      if (data.success) {
        setVideos(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.videoId) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/extras/videos/${deleteModal.videoId}?modifiedBy=1`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        addToast("success", "Success", "Video deleted successfully");
        fetchVideos();
        setDeleteModal({ isOpen: false, videoId: null });
      } else {
        addToast("error", "Error", data.error || "Failed to delete video");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete video");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingVideo(null);
  };

  const handleFormSuccess = () => {
    fetchVideos();
    handleFormClose();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Ads Videos"
          subtitle="Manage your promotional and advertisement videos"
          badge={{ text: "EXTRAS", variant: "purple" }}
          actions={
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsFormOpen(true)}
            >
              Add Video
            </Button>
          }
        />

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search videos by title..."
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">{total}</span> total
            </div>
          </div>
        </div>

        {/* Table */}
        <VideosTable
          videos={videos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteModal({ isOpen: true, videoId: id })}
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

      {/* Form Modal */}
      <VideoFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editingVideo={editingVideo}
      />

      {/* Delete Confirmation */}
      <ActionModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, videoId: null })}
        onConfirm={handleDelete}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}