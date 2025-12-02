// app/courses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookOpen,
  Users,
  Eye,
  Trash2,
  Package,
  ChevronDown,
  ChevronUp,
  Filter,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { DeleteConfirmModal } from "@/components/courses/DeleteConfirmModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";

interface Course {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number | null;
  offer_price: number | null;
  is_paid: number;
  category: {
    id: number;
    name: string;
  } | null;
  _count: {
    chapters: number;
    course_purchase: number;
  };
  created_at: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isPaidFilter, setIsPaidFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const addToast = useToast();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, [
    searchQuery,
    selectedCategory,
    isPaidFilter,
    sortBy,
    sortOrder,
    pagination.page,
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/courses/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: sortBy,
        order: sortOrder,
      });

      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedCategory) params.append("category_id", selectedCategory);
      if (isPaidFilter !== "") params.append("is_paid", isPaidFilter);

      const response = await fetch(`/api/courses?${params}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      } else {
        addToast("error", "Error", "Failed to fetch courses");
      }
    } catch (error) {
      addToast("error", "Error", "Error fetching courses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCourse) return;

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Course deleted successfully");
        fetchCourses();
        setShowDeleteModal(false);
        setSelectedCourse(null);
      } else {
        addToast("error", "Error", data.error || "Failed to delete course");
      }
    } catch (error) {
      addToast("error", "Error", "Error deleting course");
      console.error(error);
    }
  };

  const activeFiltersCount = [selectedCategory, isPaidFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Courses"
          subtitle="Manage your courses and content"
          actions={
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => router.push("/courses/create")}
            >
              Create Course
            </Button>
          }
        />

        {/* Search & Sort Bar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search courses..."
              className="flex-1 min-w-[240px]"
            />

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split("-");
                setSortBy(newSort);
                setSortOrder(newOrder);
              }}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]/50 transition-all"
            >
              <option value="created_at-desc">Latest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>

            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 bg-white/30 rounded-full text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
              {filtersExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Collapsible Filters */}
          {filtersExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 animate-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === ""
                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id.toString())}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === cat.id.toString()
                          ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md"
                          : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Pricing
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPaidFilter(isPaidFilter === "0" ? "" : "0")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isPaidFilter === "0"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setIsPaidFilter(isPaidFilter === "1" ? "" : "1")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isPaidFilter === "1"
                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Premium
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {pagination.total}
            </span>{" "}
            {pagination.total === 1 ? "course" : "courses"} found
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
              >
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 mb-4">
              <Package className="w-8 h-8 text-[#FF6B35]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search or filters to find what you're looking for"
                : "Get started by creating your first course and share your knowledge"}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => router.push("/courses/create")}
              >
                Create Course
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#FF6B35]/40 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Compact Image */}
                  <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
                    {course.image ? (
                      <img
                        src={avatar(course.image)}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10">
                        <BookOpen className="w-12 h-12 text-[#FF6B35]/40" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute inset-x-0 top-0 p-2 flex items-start justify-between">
                      {course.is_paid === 0 ? (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-md shadow-lg backdrop-blur-sm">
                          FREE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-xs font-bold rounded-md shadow-lg backdrop-blur-sm">
                          PREMIUM
                        </span>
                      )}
                      {course.category && (
                        <span className="px-2 py-0.5 bg-white/95 dark:bg-gray-900/95 text-[#FF6B35] text-xs font-semibold rounded-md shadow-lg backdrop-blur-sm">
                          {course.category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 leading-snug">
                      {course.name}
                    </h3>

                    {course.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                        {course.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="font-medium">{course._count.chapters}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-medium">{course._count.course_purchase}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      {course.is_paid === 1 ? (
                        <div className="flex items-baseline gap-2">
                          {course.offer_price &&
                          course.offer_price < (course.price || 0) ? (
                            <>
                              <span className="text-lg font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                ₹{course.offer_price}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                ₹{course.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                              ₹{course.price}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          Free
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => router.push(`/courses/${course.id}`)}
                        className="flex-1 text-xs font-medium"
                      >
                        View
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => handleDelete(course)}
                        ariaLabel="Delete"
                        className="shrink-0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-4"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: pageNum }))
                        }
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                          pagination.page === pageNum
                            ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#FF6B35]/30"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedCourse && (
        <DeleteConfirmModal
          title="Delete Course"
          message={`Are you sure you want to delete "${selectedCourse.name}"? ${
            selectedCourse._count.course_purchase
              ? `This course has ${selectedCourse._count.course_purchase} enrollments.`
              : ""
          } This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
}