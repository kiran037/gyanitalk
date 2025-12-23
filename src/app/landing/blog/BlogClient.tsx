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
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

/* ================= TYPES ================= */

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

interface ApiResponse {
  data: Blog[];
  categories?: Category[];
  popularBlogs?: PopularBlog[];
  pagination: Pagination;
}

/* ================= COMPONENT ================= */

export default function BlogClient({
  initialData,
}: {
  initialData: ApiResponse;
}) {
  /* ================= STATE ================= */

  const [blogs, setBlogs] = useState<Blog[]>(initialData.data || []);
  const [categories, setCategories] = useState<Category[]>(
    initialData.categories || [],
  );
  const [popularBlogs, setPopularBlogs] = useState<PopularBlog[]>(
    initialData.popularBlogs || [],
  );
  const [pagination, setPagination] = useState<Pagination>(
    initialData.pagination,
  );

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(
    initialData.pagination?.currentPage || 1,
  );

  const prefersReducedMotion = useReducedMotion();

  /* ================= PARTICLES ================= */

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        left: 5 + (i % 4) * 25,
        top: 10 + Math.floor(i / 4) * 30,
        xOffset: (i % 2 === 0 ? 1 : -1) * 30,
        yOffset: (i % 3 === 0 ? 1 : -1) * 30,
      })),
    [],
  );

  /* ================= FETCH (CLIENT UPDATES) ================= */

  useEffect(() => {
    const controller = new AbortController();

    async function fetchBlogs() {
      if (!blogs.length) setLoading(true);
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

        const res = await fetch(`/api/landing/blog?${params}`, {
          signal: controller.signal,
        });

        const data = await res.json();

        if (data?.success) {
          setBlogs(data.data || []);
          setCategories(data.categories || []);
          setPopularBlogs(data.popularBlogs || []);
          setPagination(data.pagination);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Blog fetch failed:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
    return () => controller.abort();
  }, [selectedCategory, currentPage, sortBy, appliedSearch]);

  /* ================= HELPERS ================= */

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearch(searchQuery);
  };

  // const stripHtml = (html: string) =>
  //   html
  //     .replace(/<[^>]*>/g, "")
  //     .replace(/&nbsp;/g, " ")
  //     .trim();

  // const truncateText = (text: string, max: number) => {
  //   const clean = stripHtml(text);
  //   return clean.length <= max ? clean : clean.slice(0, max).trim() + "...";
  // };

  const stripHtml = (html: string) => {
  // If it's JSON from TipTap editor
  try {
    const parsed = JSON.parse(html);
    if (parsed && parsed.type === "doc" && parsed.content) {
      // Extract text from TipTap JSON structure
      const extractText = (node: any): string => {
        if (node.type === "text") return node.text || "";
        if (node.content) {
          return node.content.map(extractText).join(" ");
        }
        return "";
      };
      const text = parsed.content.map(extractText).join(" ");
      return text.replace(/\s+/g, " ").trim();
    }
  } catch (e) {
    // Not JSON, treat as HTML
  }
  
  // Strip HTML tags
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const truncateText = (text: string, max: number) => {
  const clean = stripHtml(text);
  return clean.length <= max ? clean : clean.slice(0, max).trim() + "...";
};

  /* ================= UI ================= */

  return (
    <>
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

          {/* Floating Particles - only on md+ and if motion allowed */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0 hidden md:block">
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  className="pointer-events-none absolute"
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
                    <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] opacity-60 blur-[2px]" />
                    <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] opacity-30" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Gradient Orbs - only on sm+ */}
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute -left-1/4 top-1/4 hidden h-72 w-72 rounded-full bg-[#FF6B35] opacity-20 mix-blend-multiply blur-3xl filter dark:opacity-10 sm:block sm:h-96 sm:w-96"
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
                className="absolute -right-1/4 top-1/3 hidden h-72 w-72 rounded-full bg-[#FFB347] opacity-20 mix-blend-multiply blur-3xl filter dark:opacity-10 sm:block sm:h-96 sm:w-96"
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
              transition={{ duration: 0.8 }}
              className="space-y-5 sm:space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-4 py-2 backdrop-blur-sm">
                <BookOpen className="h-4 w-4 text-[#FF6B35]" />
                <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                  BLOG &amp; INSIGHTS
                </span>
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-gray-900 dark:text-white">
                  Astrology{" "}
                </span>
                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  Insights
                </span>
              </h1>

              <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
                Discover wisdom from ancient texts and modern interpretations
              </p>

              {/* Search Bar */}
              <div className="mx-auto max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search articles, topics, or authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3.5 pr-11 text-sm text-gray-900 backdrop-blur-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700/60 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 sm:px-5 sm:pr-12 sm:text-base"
                  />
                  <button
                    onClick={handleSearch}
                    aria-label="Search blogs"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] p-2 text-white transition-all hover:scale-105"
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
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Main Content - 8 columns */}
              <div className="lg:col-span-8">
                {/* Filters Bar */}
                <motion.div
                  className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/60 pb-4 dark:border-gray-700/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {pagination.totalCount}
                    </span>{" "}
                    articles
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="blog-sort"
                      className="text-xs text-gray-600 dark:text-gray-400"
                    >
                      Sort:
                    </label>

                    <select
                      id="blog-sort"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-gray-200/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700/60 dark:bg-white/5 dark:text-white"
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
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          selectedCategory === ""
                            ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                            : "border border-gray-200/60 bg-white/70 text-gray-700 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
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
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            selectedCategory === category.id
                              ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                              : "border border-gray-200/60 bg-white/70 text-gray-700 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse overflow-hidden rounded-xl border border-gray-200/60 bg-white/70 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                      >
                        <div className="h-40 w-full bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-3 p-4">
                          <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-3 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : blogs.length === 0 ? (
                  <motion.div
                    className="rounded-2xl border border-gray-200/60 bg-white/70 py-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:py-16"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <BookOpen className="mx-auto mb-4 h-14 w-14 text-gray-300 dark:text-gray-600 sm:h-16 sm:w-16" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                      No Articles Found
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                      Try adjusting your filters or search query
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Blog Grid */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2">
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
                              className="h-full overflow-hidden rounded-xl border border-gray-200/60 bg-white/70 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
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
                                <Image
                                  src={avatar(blog.blogImage)}
                                  alt={blog.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {blog.categoryName && (
                                  <div className="absolute left-2 top-2 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] backdrop-blur-sm dark:bg-gray-900/95">
                                    {blog.categoryName}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="p-4">
                                <h3 className="mb-2 line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white sm:text-base">
                                  {blog.title}
                                </h3>

                                <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                  {blog.seo?.excerpt ||
                                    truncateText(blog.description, 100)}
                                </p>

                                {/* Meta Info */}
                                <div className="flex items-center justify-between border-t border-gray-200/60 pt-3 text-[10px] text-gray-500 dark:border-gray-700/60">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      <span className="max-w-[80px] truncate">
                                        {blog.author}
                                      </span>
                                    </div>
                                    {blog.seo?.readingTime && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{blog.seo.readingTime}m</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
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
                        className="flex items-center justify-center gap-2"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                      >
                        <motion.button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={!pagination.hasPrevPage}
                          className="rounded-xl border border-gray-200/60 bg-white/70 px-4 py-2 text-xs font-medium text-gray-700 backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300 sm:text-sm"
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
                                  className={`h-8 w-8 rounded-xl text-xs font-medium transition-all sm:h-10 sm:w-10 sm:text-sm ${
                                    currentPage === pageNum
                                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                      : "border border-gray-200/60 bg-white/70 text-gray-700 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
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
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, pagination.totalPages),
                            )
                          }
                          disabled={!pagination.hasNextPage}
                          className="rounded-xl border border-gray-200/60 bg-white/70 px-4 py-2 text-xs font-medium text-gray-700 backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300 sm:text-sm"
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
                    className="rounded-xl border border-gray-200/60 bg-white/70 p-5 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 lg:sticky lg:top-24"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="mb-4 flex items-center gap-2 sm:mb-5">
                      <TrendingUp className="h-4 w-4 text-[#FF6B35]" />
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                        Trending
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {popularBlogs.slice(0, 5).map((blog, index) => (
                        <Link
                          href={`/landing/blog/${blog.slug || blog.id}`}
                          key={blog.id}
                          className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
                        >
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FFB347] text-xs font-bold text-white">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="mb-1 line-clamp-2 text-xs font-semibold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white sm:text-sm">
                              {blog.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <Eye className="h-2.5 w-2.5" />
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
