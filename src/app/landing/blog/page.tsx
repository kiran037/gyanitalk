"use client";

import { useState, useEffect, useMemo } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  BookOpen,
  Eye,
  User,
  ChevronRight,
  Search,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import Head from "next/head";
import { motion, useReducedMotion } from "framer-motion";

interface Blog {
  id: string;
  slug?: string;
  title: string;
  blogImage: string;
  description: string;
  author: string;
  postedOn: string;
  viewer: string;
  blogCategoryId: string | null;
  categoryName?: string | null;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    excerpt: string;
    readingTime: number;
  };
}

interface Category {
  id: string;
  name: string;
}

interface PopularBlog {
  id: string;
  title: string;
  slug: string;
  blogImage: string;
  viewer: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface SEOData {
  title: string;
  description: string;
  canonical: string;
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularBlogs, setPopularBlogs] = useState<PopularBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [seoData, setSeoData] = useState<SEOData>({
    title: "Astrology Blog - Insights & Horoscopes",
    description: "Explore astrology insights, horoscopes, and expert advice.",
    canonical: "/blog",
  });

  const prefersReducedMotion = useReducedMotion();

  // Precomputed particle positions (no Math.random on every render)
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        left: 5 + (i % 4) * 25,
        top: 10 + Math.floor(i / 4) * 30,
        xOffset: (i % 2 === 0 ? 1 : -1) * 30,
        yOffset: (i % 3 === 0 ? 1 : -1) * 30,
      })),
    []
  );

  // Fetch blogs whenever filters / pagination / appliedSearch change
  useEffect(() => {
    const controller = new AbortController();

    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "9",
          sortBy,
        });

        if (selectedCategory) {
          params.append("categoryId", selectedCategory);
        }

        if (appliedSearch.trim()) {
          params.append("search", appliedSearch.trim());
        }

        const response = await fetch(`/api/landing/blog?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (data.success) {
          setBlogs(data.data);
          setCategories(data.categories || []);
          setPagination(data.pagination);
          if (data.popularBlogs) setPopularBlogs(data.popularBlogs);
          if (data.seo) setSeoData(data.seo);
        }
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Failed to fetch blogs:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();

    return () => controller.abort();
  }, [selectedCategory, currentPage, sortBy, appliedSearch]);

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearch(searchQuery);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  };

  const truncateText = (text: string, maxLength: number) => {
    const stripped = stripHtml(text);
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + "...";
  };

  return (
    <>
      <Head>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <link rel="canonical" href={seoData.canonical} />
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

          {/* Floating Particles - only on md+ and if motion allowed */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0 hidden md:block">
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0.15, 0.4, 0.15],
                    scale: [1, 1.8, 1],
                    x: [0, p.xOffset, 0],
                    y: [0, p.yOffset, 0],
                  }}
                  transition={{
                    duration: 12 + i * 1.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
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

          {/* Gradient Orbs - only on sm+ */}
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute top-1/4 -left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 hidden sm:block"
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
                className="absolute top-1/3 -right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 hidden sm:block"
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
              transition={{ duration: 0.8 }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm">
                <BookOpen className="w-4 h-4 text-[#FF6B35]" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  BLOG &amp; INSIGHTS
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                <span className="text-gray-900 dark:text-white">
                  Astrology{" "}
                </span>
                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  Insights
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Discover wisdom from ancient texts and modern interpretations
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles, topics, or authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full px-4 sm:px-5 py-3.5 pr-11 sm:pr-12 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-lg transition-all hover:scale-105"
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
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Main Content - 8 columns */}
              <div className="lg:col-span-8">
                {/* Filters Bar */}
                <motion.div
                  className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/60 dark:border-gray-700/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {pagination.totalCount}
                    </span>{" "}
                    articles
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      Sort:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                    >
                      <option value="latest">Latest</option>
                      <option value="popular">Popular</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </div>
                </motion.div>

                {/* Category Filter Pills */}
                {categories.length > 0 && (
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex flex-wrap gap-2">
                      <motion.button
                        onClick={() => {
                          setSelectedCategory("");
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedCategory === ""
                            ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                            : "bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        All Topics
                      </motion.button>
                      {categories.map((category) => (
                        <motion.button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCategory === category.id
                              ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                              : "bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {category.name}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Loading / Empty / List */}
                {loading ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden animate-pulse"
                      >
                        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700" />
                        <div className="p-4 space-y-3">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : blogs.length === 0 ? (
                  <motion.div
                    className="text-center py-12 sm:py-16 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <BookOpen className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Articles Found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Try adjusting your filters or search query
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Blog Grid */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                      {blogs.map((blog, index) => (
                        <motion.div
                          key={blog.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <Link
                            href={`/landing/blog/${blog.slug || blog.id}`}
                            className="group block h-full"
                          >
                            <motion.article
                              className="h-full bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden"
                              whileHover={{
                                scale: 1.02,
                                borderColor: "rgba(255, 107, 53, 0.5)",
                                boxShadow:
                                  "0 10px 30px rgba(255, 107, 53, 0.15)",
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              {/* Image */}
                              <div className="relative h-40 overflow-hidden">
                                <img
                                  src={avatar(blog.blogImage)}
                                  alt={blog.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {blog.categoryName && (
                                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-[#FF6B35] text-[10px] font-bold rounded-lg">
                                    {blog.categoryName}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="p-4">
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#FF6B35] transition-colors line-clamp-2">
                                  {blog.title}
                                </h3>

                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                                  {blog.seo?.excerpt ||
                                    truncateText(blog.description, 100)}
                                </p>

                                {/* Meta Info */}
                                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      <span className="truncate max-w-[80px]">
                                        {blog.author}
                                      </span>
                                    </div>
                                    {blog.seo?.readingTime && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{blog.seo.readingTime}m</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    <span>{blog.viewer}</span>
                                  </div>
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
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={!pagination.hasPrevPage}
                          className="px-4 py-2 bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
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
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                                    currentPage === pageNum
                                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                      : "bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 backdrop-blur-sm"
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
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, pagination.totalPages)
                            )
                          }
                          disabled={!pagination.hasNextPage}
                          className="px-4 py-2 bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
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

              {/* Sidebar - 4 columns */}
              <aside className="lg:col-span-4">
                {popularBlogs.length > 0 && (
                  <motion.div
                    className="bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-5 lg:sticky lg:top-24"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4 sm:mb-5">
                      <TrendingUp className="w-4 h-4 text-[#FF6B35]" />
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        Trending
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {popularBlogs.slice(0, 5).map((blog, index) => (
                        <Link
                          href={`/landing/blog/${blog.slug || blog.id}`}
                          key={blog.id}
                          className="group flex gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center font-bold text-white text-xs">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors line-clamp-2 mb-1">
                              {blog.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <Eye className="w-2.5 h-2.5" />
                              <span>{blog.viewer}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </aside>
            </div>
          </div>
        </section>
      </LandingWrapper>
    </>
  );
}