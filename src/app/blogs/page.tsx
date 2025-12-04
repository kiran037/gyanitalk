// app/blogs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { BlogCard } from "@/components/blogs/BlogCard";
import { BlogFilters } from "@/components/blogs/BlogFilters";
import {
  Plus,
  Filter,
  Download,
  Trash2,
  CheckSquare,
  Square,
  Power,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug?: string;
  blogImage: string;
  previewImage?: string;
  author: string;
  postedOn: string;
  viewer: string;
  isActive: boolean;
  blogCategoryId: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function BlogsPage() {
  const router = useRouter();
  const addToast = useToast();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 1,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; blogId: string | null }>({
    isOpen: false,
    blogId: null,
  });
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [currentPage, sortBy, sortOrder, selectedCategory, statusFilter]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy,
        sortOrder,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (statusFilter) params.append("isActive", statusFilter);

      const response = await fetch(`/api/blogs?${params}`);
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data);
        setPagination(data.pagination);
      } else {
        addToast("error", "Error", data.error || "Failed to fetch blogs");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blogs/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleDelete = async (blogId: string) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Blog deleted successfully");
        fetchBlogs();
        setDeleteModal({ isOpen: false, blogId: null });
      } else {
        addToast("error", "Error", data.error || "Failed to delete blog");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete blog");
    }
  };

  const handleToggleStatus = async (blogId: string) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}/toggle-status`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        fetchBlogs();
      } else {
        addToast("error", "Error", data.error || "Failed to toggle status");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to toggle status");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedBlogs.length === 0) {
      addToast("warning", "Warning", "Please select blogs first");
      return;
    }

    setBulkActionLoading(true);
    try {
      const response = await fetch("/api/blogs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: action,
          blogIds: selectedBlogs,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", data.message);
        setSelectedBlogs([]);
        setSelectionMode(false);
        fetchBlogs();
      } else {
        addToast("error", "Error", data.error || "Bulk action failed");
      }
    } catch (error) {
      addToast("error", "Error", "Bulk action failed");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (statusFilter) params.append("isActive", statusFilter);

      const response = await fetch(`/api/blogs/bulk?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blogs-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast("success", "Success", "Blogs exported successfully");
    } catch (error) {
      addToast("error", "Error", "Failed to export blogs");
    }
  };

  const toggleSelectBlog = (blogId: string) => {
    setSelectedBlogs((prev) =>
      prev.includes(blogId)
        ? prev.filter((id) => id !== blogId)
        : [...prev, blogId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBlogs.length === blogs.length) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(blogs.map((b) => b.id));
    }
  };

  const startSelectionMode = () => {
    setSelectionMode(true);
    setSelectedBlogs([]);
  };

  const cancelSelectionMode = () => {
    setSelectionMode(false);
    setSelectedBlogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Blog Management"
        subtitle="Manage your blog posts, categories, and content"
        badge={{ text: "Content", variant: "purple" }}
        actions={
          <div className="flex items-center gap-3">
            {!selectionMode ? (
              <>
                <Button
                  variant="outline"
                  icon={<CheckSquare className="w-4 h-4" />}
                  onClick={startSelectionMode}
                >
                  Select
                </Button>
                <Button
                  variant="outline"
                  icon={<Download className="w-4 h-4" />}
                  onClick={handleExportCSV}
                >
                  Export
                </Button>
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => router.push("/blogs/new")}
                >
                  New Blog
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={cancelSelectionMode}
              >
                Cancel Selection
              </Button>
            )}
          </div>
        }
      />

      {/* Search & Filters */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search blogs by title or author..."
            className="flex-1"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
            </Button>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>

        {showFilters && (
          <BlogFilters
            categories={categories}
            selectedCategory={selectedCategory}
            statusFilter={statusFilter}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onCategoryChange={setSelectedCategory}
            onStatusChange={setStatusFilter}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
          />
        )}
      </div>

      {/* Selection Mode Actions */}
      {selectionMode && selectedBlogs.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedBlogs.length} {selectedBlogs.length === 1 ? 'blog' : 'blogs'} selected
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Choose an action to apply
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Power className="w-4 h-4" />}
                onClick={() => handleBulkAction("activate")}
                loading={bulkActionLoading}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Power className="w-4 h-4" />}
                onClick={() => handleBulkAction("deactivate")}
                loading={bulkActionLoading}
              >
                Deactivate
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => handleBulkAction("delete")}
                loading={bulkActionLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Layers className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Blogs Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Get started by creating your first blog post and share your content with the world
          </p>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => router.push("/blogs/new")}
          >
            Create Your First Blog
          </Button>
        </div>
      ) : (
        <>
          {/* Select All - Only show in selection mode */}
          {selectionMode && (
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {selectedBlogs.length === blogs.length ? (
                  <CheckSquare className="w-4 h-4 text-orange-500" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedBlogs.length === blogs.length ? 'Deselect All' : 'Select All'}
                </span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                isSelected={selectedBlogs.includes(blog.id)}
                selectionMode={selectionMode} // <-- ADD THIS
                onSelect={toggleSelectBlog}
                onEdit={() => router.push(`/blogs/${blog.id}`)}
                onDelete={() =>
                  setDeleteModal({ isOpen: true, blogId: blog.id })
                }
                onToggleStatus={handleToggleStatus}
              />

            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <Button
                variant="outline"
                size="sm"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      <ActionModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, blogId: null })}
        onConfirm={() => deleteModal.blogId && handleDelete(deleteModal.blogId)}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}