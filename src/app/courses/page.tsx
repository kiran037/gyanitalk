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
  Filter,
  Clock,
  Star,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
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

        {/* Search & Filters Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Top Bar */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search courses..."
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSort, newOrder] = e.target.value.split("-");
                    setSortBy(newSort);
                    setSortOrder(newOrder);
                  }}
                  className="pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                >
                  <option value="created_at-desc">Latest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>

                <button
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filtersExpanded
                      ? "bg-[#FF6B35] text-white shadow-lg shadow-orange-500/25"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white/20 rounded-full text-xs font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${filtersExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span> {pagination.total === 1 ? "course" : "courses"}
            </div>
          </div>

          {/* Collapsible Filters */}
          {filtersExpanded && (
            <div className="px-4 sm:px-6 pb-6 space-y-6 border-t border-gray-100 dark:border-gray-800 pt-6">
              {/* Categories */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === ""
                        ? "bg-[#FF6B35] text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id.toString())}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === cat.id.toString()
                          ? "bg-[#FF6B35] text-white shadow-md"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                  Pricing
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPaidFilter(isPaidFilter === "0" ? "" : "0")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isPaidFilter === "0"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setIsPaidFilter(isPaidFilter === "1" ? "" : "1")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isPaidFilter === "1"
                        ? "bg-[#FF6B35] text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    Premium
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-200 dark:bg-gray-800" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery || activeFiltersCount > 0
                ? "Try adjusting your search or filters"
                : "Get started by creating your first course"}
            </p>
            {!searchQuery && activeFiltersCount === 0 && (
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:shadow-gray-900/5 dark:hover:shadow-black/20 transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                    {course.image ? (
                      <img
                        src={avatar(course.image)}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700" />
                      </div>
                    )}
                    
                    {/* Overlay gradient for better badge visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
                    
                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                      {course.is_paid === 0 ? (
                        <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-md shadow-lg">
                          FREE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-xs font-bold rounded-md shadow-lg">
                          PREMIUM
                        </span>
                      )}
                      {course.category && (
                        <span className="px-2.5 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-semibold rounded-md shadow-lg">
                          {course.category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    {/* Title */}
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-2 min-h-[3rem]">
                      {course.name}
                    </h3>

                    {/* Description */}
                    {course.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {course.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 py-3 border-y border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-medium">{course._count.chapters}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">{course._count.course_purchase}</span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        {course.is_paid === 1 ? (
                          <div className="flex items-baseline gap-2">
                            {course.offer_price && course.offer_price < (course.price || 0) ? (
                              <>
                                <span className="text-2xl font-bold text-[#FF6B35]">
                                  ₹{course.offer_price}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{course.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-[#FF6B35]">
                                ₹{course.price}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-emerald-500">
                            Free
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/courses/${course.id}`)}
                          className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-[#FF6B35] hover:text-white text-gray-700 dark:text-gray-300 rounded-lg transition-all"
                          aria-label="View course"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course)}
                          className="p-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-500 text-red-600 hover:text-white dark:text-red-400 rounded-lg transition-all"
                          aria-label="Delete course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

                <div className="flex items-center gap-1.5">
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
                        className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-semibold transition-all ${
                          pagination.page === pageNum
                            ? "bg-[#FF6B35] text-white shadow-md"
                            : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#FF6B35] hover:text-[#FF6B35]"
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