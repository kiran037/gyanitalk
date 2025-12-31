"use client";

import { useState, useEffect } from "react";
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

export default function BlogClient({ initialData }: { initialData: ApiResponse }) {
  /* ================= STATE ================= */

  const [blogs, setBlogs] = useState<Blog[]>(initialData.data || []);
  const [categories, setCategories] = useState<Category[]>(initialData.categories || []);
  const [popularBlogs, setPopularBlogs] = useState<PopularBlog[]>(initialData.popularBlogs || []);
  const [pagination, setPagination] = useState<Pagination>(initialData.pagination);

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(initialData.pagination?.currentPage || 1);

  const prefersReducedMotion = useReducedMotion();

  /* ================= FETCH (CLIENT UPDATES) ================= */

  useEffect(() => {
    const controller = new AbortController();

    async function fetchBlogs() {
      // Show loading skeleton only on first client-side fetch, not for pagination
      const isInitialFetch = currentPage === 1 && !selectedCategory && !appliedSearch && sortBy === "latest";
      if (!isInitialFetch) setLoading(true);

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "9",
          sortBy,
        });
        if (selectedCategory) params.append("categoryId", selectedCategory);
        if (appliedSearch.trim()) params.append("search", appliedSearch.trim());

        const res = await fetch(`/api/landing/blog?${params}`, { signal: controller.signal });
        const data = await res.json();

        if (data?.success) {
          setBlogs(data.data || []);
          if(data.categories) setCategories(data.categories);
          if(data.popularBlogs) setPopularBlogs(data.popularBlogs);
          setPagination(data.pagination);
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error("Blog fetch failed:", err);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    
    // Don't refetch if it's the initial server-rendered data
    const hasFilters = selectedCategory || appliedSearch || sortBy !== 'latest' || currentPage > 1;
    if (hasFilters) {
      fetchBlogs();
    }

    return () => controller.abort();
  }, [selectedCategory, currentPage, sortBy, appliedSearch]);

  /* ================= HELPERS ================= */

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearch(searchQuery);
  };

  const stripHtml = (html: string) => {
    // If it's JSON from TipTap editor
    const trimmedHtml = html.trim();
    if (trimmedHtml.startsWith("{") && trimmedHtml.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmedHtml);
        if (parsed && parsed.type === "doc" && parsed.content) {
          const extractText = (node: any): string => {
            if (node.type === "text") return node.text || "";
            if (node.content) return node.content.map(extractText).join(" ");
            return "";
          };
          return parsed.content.map(extractText).join(" ").replace(/\s+/g, " ").trim();
        }
      } catch (e) { /* Fallback to HTML stripping */ }
    }
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  };

  const truncateText = (text: string, max: number) => {
    const clean = stripHtml(text);
    return clean.length <= max ? clean : clean.slice(0, max).trim() + "...";
  };
  
  /* ================= SIDEBAR COMPONENT (FOR REUSE) ================= */

  const SidebarContent = () => (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-[#FF6B35]" />
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Trending Articles</h3>
      </div>
      <div className="space-y-3">
        {popularBlogs.slice(0, 5).map((blog, index) => (
          <Link href={`/blog/${blog.slug || blog.id}`} key={blog.id} className="group flex gap-4 items-center rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <span className="text-lg font-bold text-gray-300 dark:text-gray-600 group-hover:text-[#FF6B35]">
              0{index + 1}
            </span>
            <div className="min-w-0">
              <h4 className="line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-[#FF6B35] dark:text-white">
                {blog.title}
              </h4>
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <Eye className="h-3 w-3" />
                <span>{blog.viewer} views</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <LandingWrapper>
      {/* === HERO SECTION === */}
      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden px-4 pt-28 pb-12 sm:min-h-[45vh]">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/20" />
        <div className="relative z-10 w-full max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FF6B35] shadow-sm backdrop-blur-md dark:border-orange-900/40 dark:bg-white/5">
              <BookOpen className="h-4 w-4" />
              Our Blog
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
              Astrology{" "}
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Insights & Wisdom
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg">
              Explore the cosmos, understand your destiny, and find guidance in our curated articles.
            </p>
          </motion.div>
          </div>
        </section>

      {/* === MAIN CONTENT === */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            
            {/* Main Content Area */}
            <main className="lg:col-span-8">
              
              {/* Mobile Sidebar (Visible on < lg screens) */}
              {popularBlogs.length > 0 && (
                <div className="mb-8 lg:hidden">
                  <SidebarContent />
                </div>
              )}

              {/* Filters & Controls */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Showing <span className="font-bold text-gray-900 dark:text-white">{blogs.length}</span> of <span className="font-bold text-gray-900 dark:text-white">{pagination.totalCount}</span> articles
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 pr-10 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:border-gray-700 dark:bg-gray-800"
                    />
                    <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-orange-500">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <option value="latest">Latest</option>
                    <option value="popular">Popular</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
              </div>

              {/* Category Pills (Scrollable on mobile) */}
              <div className="scrollbar-hide mb-8 flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => { setSelectedCategory(""); setCurrentPage(1); }}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${selectedCategory === "" ? "bg-[#FF6B35] text-white shadow" : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${selectedCategory === cat.id ? "bg-[#FF6B35] text-white shadow" : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Blog Grid */}
              {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-3 rounded-xl bg-white p-4 dark:bg-gray-800">
                      <div className="aspect-video w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
                  <Search className="mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="text-xl font-bold">No Articles Found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {blogs.map((blog, index) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={`/blog/${blog.slug || blog.id}`} className="group block h-full">
                        <article className="flex h-full flex-col">
                          <div className="relative mb-4 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={avatar(blog.blogImage)}
                              alt={blog.title}
                              width={400}
                              height={225}
                              className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex flex-1 flex-col">
                            {blog.categoryName && (
                              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
                                {blog.categoryName}
                              </p>
                            )}
                            <h3 className="flex-1 text-lg font-bold text-gray-900 group-hover:text-[#FF6B35] dark:text-white">
                              {blog.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                              {blog.seo?.excerpt || truncateText(blog.description, 100)}
                            </p>
                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                              <span className="font-medium">{blog.author}</span>
                              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {blog.viewer}</span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button onClick={() => setCurrentPage(p => p - 1)} disabled={!pagination.hasPrevPage} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-gray-700">
                    Previous
                  </button>
                  <span className="px-2 text-sm text-gray-500 sm:hidden">Page {currentPage} of {pagination.totalPages}</span>
                  <div className="hidden items-center gap-1 sm:flex">
                    {Array.from({ length: Math.min(pagination.totalPages, 5)}, (_, i) => {
                       let pageNum;
                       if (pagination.totalPages <= 5) pageNum = i + 1;
                       else if (currentPage <= 3) pageNum = i + 1;
                       else if (currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                       else pageNum = currentPage - 2 + i;
                       return pageNum;
                    }).map(pageNum => (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`h-9 w-9 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-[#FF6B35] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={!pagination.hasNextPage} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-gray-700">
                    Next
                  </button>
                </div>
              )}
            </main>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-24">
                <SidebarContent />
              </div>
            </aside>
          </div>
        </div>
      </section>
      
      {/* Utility to hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </LandingWrapper>
  );
}