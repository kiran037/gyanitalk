"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
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
import Head from "next/head";
import { motion, useReducedMotion } from "framer-motion";

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
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    schemaJson: string;
  };
  createdAt: string;
  updatedAt: string;
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isPaidFilter, setIsPaidFilter] = useState<string>("");
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

  useEffect(() => {
    const controller = new AbortController();

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "12",
          sortBy,
          sortOrder,
        });

        if (selectedCategory) {
          params.append("categoryId", selectedCategory);
        }

        if (isPaidFilter !== "") {
          params.append("isPaid", isPaidFilter);
        }

        if (appliedSearchQuery.trim()) {
          params.append("search", appliedSearchQuery.trim());
        }

        const response = await fetch(`/api/landing/courses?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (data.success) {
          setCourses(data.data.courses);
          setPagination(data.data.pagination);

          const uniqueCategories = Array.from(
            new Map(
              data.data.courses
                .filter((c: Course) => c.category)
                .map((c: Course) => [c.category!.id, c.category])
            ).values()
          ) as Category[];
          setCategories(uniqueCategories);
        }
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Failed to fetch courses:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    return () => controller.abort();
  }, [selectedCategory, isPaidFilter, currentPage, sortBy, sortOrder, appliedSearchQuery]);

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <>
      <Head>
        <title>Astrology Courses - Learn Vedic Astrology Online</title>
        <meta
          name="description"
          content="Explore comprehensive astrology courses from beginner to advanced levels. Learn Vedic astrology, horoscope reading, and more from expert astrologers."
        />
        <link rel="canonical" href="/landing/courses" />
      </Head>

      <LandingWrapper>
        {/* Hero Section */}
        <section className="relative min-h-[40vh] sm:min-h-[45vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-24 sm:pt-28 pb-6 sm:pb-8">
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
                  className="absolute pointer-events-none"
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
                    <div className="w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-[2px] opacity-60" />
                    <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full animate-ping opacity-30" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Gradient Orbs - only on md+ and not for reduced motion */}
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="hidden md:block absolute top-1/4 -left-1/4 w-80 h-80 md:w-96 md:h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
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
                className="hidden md:block absolute top-1/3 -right-1/4 w-80 h-80 md:w-96 md:h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
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

          <div className="relative z-10 max-w-7xl mx-auto w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm">
                <GraduationCap className="w-4 h-4 text-[#FF6B35]" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  ASTROLOGY COURSES
                </span>
              </div>

              <div className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                <span className="text-gray-900 dark:text-white">Master </span>
                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  Vedic Astrology
                </span>
              </div>

              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Transform your life with ancient wisdom and modern techniques
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses by name or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 pr-11 sm:pr-12 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-lg transition-all hover:scale-105"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Filters Bar */}
            <motion.div
              className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-6 pb-4 border-b border-gray-200/60 dark:border-gray-700/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
                      "-"
                    ) as [string, "asc" | "desc"];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 sm:px-3 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === ""
                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                        : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === category.id.toString()
                          ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                          : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isPaidFilter === "0"
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                      : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-3 h-3" />
                  Free Courses
                </motion.button>
                <motion.button
                  onClick={() => {
                    setIsPaidFilter(isPaidFilter === "1" ? "" : "1");
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isPaidFilter === "1"
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                      : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Award className="w-3 h-3" />
                  Premium Courses
                </motion.button>
              </div>
            </motion.div>

            {/* Loading State */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="w-full h-40 sm:h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <motion.div
                className="text-center py-12 sm:py-16 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Package className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Courses Found
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search query
                </p>
              </motion.div>
            ) : (
              <>
                {/* Courses Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                    >
                      <Link
                        href={`/landing/courses/${course.slug}`}
                        className="group block h-full"
                      >
                        <motion.article
                          className="h-full bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden"
                          whileHover={{
                            scale: 1.02,
                            borderColor: "rgba(255, 107, 53, 0.5)",
                            boxShadow:
                              "0 10px 30px rgba(255, 107, 53, 0.15)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Image */}
                          <div className="relative overflow-hidden h-44 sm:h-56">
                            <img
                              src={avatar(course.image)}
                              alt={course.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {course.isPaid === 0 && (
                                <div className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Free
                                </div>
                              )}
                              {course.isPaid === 1 && (
                                <div className="px-2 py-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                                  <Award className="w-2.5 h-2.5" />
                                  Premium
                                </div>
                              )}
                            </div>
                            {course.category && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-[#FF6B35] text-[10px] font-bold rounded-lg">
                                {course.category.name}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-4 flex flex-col flex-1">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#FF6B35] transition-colors line-clamp-2">
                              {course.name}
                            </h2>

                            {course.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                                {truncateText(course.description, 100)}
                              </p>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-3 mb-3 text-[10px] text-gray-500">
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                <span>{course.statistics.totalChapters} chapters</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>
                                  {course.statistics.totalEnrollments} enrolled
                                </span>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                              <div>
                                {course.isPaid === 1 ? (
                                  <div className="flex items-center gap-2">
                                    {course.offerPrice !== null &&
                                    course.offerPrice < (course.price || 0) ? (
                                      <>
                                        <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                          ₹{course.offerPrice}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-400 line-through">
                                          ₹{course.price}
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                        ₹{course.price}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
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
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                View
                                <ChevronRight className="w-3 h-3" />
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
                    className="flex justify-center items-center gap-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <motion.button
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
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
                          } else if (
                            currentPage >=
                            pagination.totalPages - 2
                          ) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <motion.button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                  : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 backdrop-blur-sm"
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {pageNum}
                            </motion.button>
                          );
                        }
                      )}
                    </div>

                    <motion.button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
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
    </>
  );
}