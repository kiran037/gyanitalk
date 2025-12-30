///Users/xeoren/Desktop/gyanitallk-admin/src/app/landing/courses/CoursesClient.tsx
"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Search,
  Users,
  ChevronRight,
  Sparkles,
  Award,
  GraduationCap,
  Package,
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import { motion } from "framer-motion";
import Image from "next/image";

/* ================= TYPES ================= */

interface Course {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number | null;
  offerPrice: number | null;
  isPaid: number;
  category: {
    id: number;
    name: string;
    image: string;
  } | null;
  statistics: {
    totalChapters: number;
    freeChapters: number;
    paidChapters: number;
    totalEnrollments: number;
    activeEnrollments: number;
  };
}

interface Category {
  id: number;
  name: string;
  image: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/* ================= COMPONENT ================= */

export default function CoursesClient() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [isPaidFilter, setIsPaidFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const prefersReducedMotion = useReducedMotion();

  /* ================= FETCH COURSES ================= */

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCourses() {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "12",
          sortBy,
          sortOrder,
        });

        if (selectedCategory) params.append("categoryId", selectedCategory);
        if (isPaidFilter !== "") params.append("isPaid", isPaidFilter);
        if (appliedSearchQuery.trim())
          params.append("search", appliedSearchQuery.trim());

        const res = await fetch(`/api/landing/courses?${params}`, {
          signal: controller.signal,
        });

        const json = await res.json();

        if (json.success) {
          setCourses(json.data.courses);
          setPagination(json.data.pagination);

          const uniqueCategories = Array.from(
            new Map(
              json.data.courses
                .filter((c: Course) => c.category)
                .map((c: Course) => [c.category!.id, c.category]),
            ).values(),
          ) as Category[];

          setCategories(uniqueCategories);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Failed to fetch courses:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
    return () => controller.abort();
  }, [
    selectedCategory,
    isPaidFilter,
    currentPage,
    sortBy,
    sortOrder,
    appliedSearchQuery,
  ]);

  /* ================= HELPERS ================= */

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.slice(0, maxLength).trim() + "..."
      : text;
  };

  /* ================= RENDER ================= */

  return (
    <LandingWrapper>
      {/* Hero Section */}
      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden px-4 pb-6 pt-24 sm:min-h-[45vh] sm:px-6 sm:pb-8 sm:pt-28 lg:px-8">
        {/* Animated Grid Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating Particles - hide on mobile & when reduced motion */}
        {!prefersReducedMotion && (
          <div className="hidden sm:block">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.15, 0.4, 0.15],
                  scale: [1, 1.8, 1],
                  x: [0, Math.random() * 60 - 30, 0],
                  y: [0, Math.random() * 60 - 30, 0],
                }}
                transition={{
                  duration: 12 + i * 1.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${5 + (i % 4) * 25}%`,
                  top: `${10 + Math.floor(i / 4) * 30}%`,
                }}
              >
                <div className="relative">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] opacity-60 blur-[2px]" />
                  <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] opacity-30" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Gradient Orbs - only on md+ and not for reduced motion */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute -left-1/4 top-1/4 hidden h-80 w-80 rounded-full bg-[#FF6B35] opacity-20 mix-blend-multiply blur-3xl filter dark:opacity-10 md:block md:h-96 md:w-96"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -right-1/4 top-1/3 hidden h-80 w-80 rounded-full bg-[#FFB347] opacity-20 mix-blend-multiply blur-3xl filter dark:opacity-10 md:block md:h-96 md:w-96"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -30, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </>
        )}

        <div className="relative z-10 mx-auto w-full max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-5 sm:space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2">
              <GraduationCap className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                ASTROLOGY COURSES
              </span>
            </div>

            <div className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gray-900 dark:text-white">Master </span>
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Vedic Astrology
              </span>
            </div>

            <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
              Transform your life with ancient wisdom and modern techniques
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <label htmlFor="course-search" className="sr-only">
                  Search courses
                </label>

                <input
                  id="course-search"
                  type="text"
                  placeholder="Search courses by name or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full rounded-xl border border-gray-200/60 bg-white/60 px-4 py-3 pr-11 text-sm text-gray-900 backdrop-blur-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700/60 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 sm:px-5 sm:py-3.5 sm:pr-12 sm:text-base"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] p-2 text-white transition-all hover:scale-105 sm:right-3"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Filters Bar */}
          <motion.div
            className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/60 pb-4 dark:border-gray-700/60 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              <span className="font-medium text-gray-900 dark:text-white">
                {pagination.totalCount}
              </span>
              courses
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sort Dropdown */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split(
                    "-",
                  ) as [string, "asc" | "desc"];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200/60 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700/60 dark:bg-white/5 dark:text-white sm:px-3"
              >
                <option value="created_at-desc">Latest</option>
                <option value="created_at-asc">Oldest</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </motion.div>

          {/* Category & Filter Pills */}
          <motion.div
            className="mb-6 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <motion.button
                  onClick={() => {
                    setSelectedCategory("");
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedCategory === ""
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                      : "border border-gray-200/60 bg-white/60 text-gray-700 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  All Categories
                </motion.button>
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id.toString());
                      setCurrentPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedCategory === category.id.toString()
                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                        : "border border-gray-200/60 bg-white/60 text-gray-700 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.name}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={() => {
                  setIsPaidFilter(isPaidFilter === "0" ? "" : "0");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isPaidFilter === "0"
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                    : "border border-gray-200/60 bg-white/60 text-gray-700 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-3 w-3" />
                Free Courses
              </motion.button>
              <motion.button
                onClick={() => {
                  setIsPaidFilter(isPaidFilter === "1" ? "" : "1");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isPaidFilter === "1"
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                    : "border border-gray-200/60 bg-white/60 text-gray-700 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Award className="h-3 w-3" />
                Premium Courses
              </motion.button>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                >
                  <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 sm:h-48"></div>
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <motion.div
              className="rounded-2xl border border-gray-200/60 bg-white/60 py-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Package className="mx-auto mb-4 h-14 w-14 text-gray-300 dark:text-gray-600 sm:h-16 sm:w-16" />
              <div className="mb-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                No Courses Found
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                Try adjusting your filters or search query
              </p>
            </motion.div>
          ) : (
            <>
              {/* Courses Grid */}
              <div className="mb-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                  >
                    <Link
                      href={`/courses/${course.slug}`}
                      className="group block h-full"
                    >
                      <motion.article
                        className="h-full overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                        whileHover={{
                          scale: 1.02,
                          borderColor: "rgba(255, 107, 53, 0.5)",
                          boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)",
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Image */}
                        <div className="relative h-44 overflow-hidden sm:h-56">
                          <Image
                            src={avatar(course.image)}
                            alt={course.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                            priority={index < 3}
                          />
                          {/* Badges */}
                          <div className="absolute left-2 top-2 flex flex-col gap-1">
                            {course.isPaid === 0 && (
                              <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                <Sparkles className="h-2.5 w-2.5" />
                                Free
                              </div>
                            )}
                            {course.isPaid === 1 && (
                              <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-2 py-0.5 text-[10px] font-bold text-white">
                                <Award className="h-2.5 w-2.5" />
                                Premium
                              </div>
                            )}
                          </div>
                          {course.category && (
                            <div className="absolute right-2 top-2 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] backdrop-blur-sm dark:bg-gray-900/95">
                              {course.category.name}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col p-4">
                          <h2 className="mb-2 line-clamp-2 text-base font-bold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white sm:text-lg">
                            {course.name}
                          </h2>

                          {course.description && (
                            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                              {truncateText(course.description, 100)}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="mb-3 flex items-center gap-3 text-[10px] text-gray-500">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>
                                {course.statistics.totalChapters} chapters
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>
                                {course.statistics.totalEnrollments} enrolled
                              </span>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-auto flex items-center justify-between border-t border-gray-200/60 pt-3 dark:border-gray-700/60">
                            <div>
                              {course.isPaid === 1 ? (
                                <div className="flex items-center gap-2">
                                  {course.offerPrice !== null &&
                                  course.offerPrice < (course.price || 0) ? (
                                    <>
                                      <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                                        ₹{course.offerPrice}
                                      </div>
                                      <div className="text-xs text-gray-400 line-through sm:text-sm">
                                        ₹{course.price}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                                      ₹{course.price}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                                  Free
                                </div>
                              )}
                              {course.statistics.freeChapters > 0 && (
                                <div className="text-[10px] text-gray-500">
                                  {course.statistics.freeChapters} free chapters
                                </div>
                              )}
                            </div>
                            <motion.button
                              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-3 py-1.5 text-xs font-medium text-white sm:px-4 sm:py-2 sm:text-sm"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View
                              <ChevronRight className="h-3 w-3" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.article>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <motion.div
                  className="flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <motion.button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="rounded-xl border border-gray-200/60 bg-white/60 px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
                    whileHover={{
                      scale: !pagination.hasPrevPage ? 1 : 1.05,
                    }}
                    whileTap={{
                      scale: !pagination.hasPrevPage ? 1 : 0.95,
                    }}
                  >
                    Previous
                  </motion.button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(pagination.totalPages, 5) },
                      (_, i) => {
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
                          <motion.button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-9 w-9 rounded-xl text-xs font-medium transition-all sm:h-10 sm:w-10 sm:text-sm ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                : "border border-gray-200/60 bg-white/60 text-gray-700 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      },
                    )}
                  </div>

                  <motion.button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={!pagination.hasNextPage}
                    className="rounded-xl border border-gray-200/60 bg-white/60 px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
                    whileHover={{
                      scale: !pagination.hasNextPage ? 1 : 1.05,
                    }}
                    whileTap={{
                      scale: !pagination.hasNextPage ? 1 : 0.95,
                    }}
                  >
                    Next
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </LandingWrapper>
  );
}
