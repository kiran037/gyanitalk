"use client";

import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  Search,
  Star,
  Clock,
  Languages,
  Award,
  X,
  TrendingUp,
  BookOpen,
  Filter,
  CheckCircle2,
  Users
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

/* ================= TYPES ================= */

interface AstrologerSEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string | null;
  schemaJson: any;
}

interface Astrologer {
  id: string;
  name: string;
  slug: string;
  profileImage: string | null;
  primarySkill: string;
  allSkill: string;
  charge: number;
  experienceInYears: number;
  languageKnown: string;
  country: string | null;
  isVerified: boolean;
  monthlyEarning: string | null;
  chatStatus: string | null;
  chatWaitTime: string | null;
  callStatus: string | null;
  callWaitTime: string | null;
  videoCallRate: number | null;
  followerCount: number;
  reviewCount: number;
  avgRating: number | null;
  loginBio?: string;
  badges: {
    top_badge: string | null;
  };
  seo: AstrologerSEO;
}

interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  structuredData: any;
}

interface ApiResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Astrologer[];
  seo: PageSEO;
}

/* ================= COMPONENT ================= */

export default function AstrologersClient({
  initialData,
}: {
  initialData: ApiResponse | null;
}) {
  const prefersReducedMotion = useReducedMotion();

  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  /* ================= INIT FROM SERVER ================= */

  useEffect(() => {
    if (initialData) {
      setAstrologers(initialData.data || []);
      setTotal(initialData.total || 0);
      setTotalPages(initialData.totalPages || 0);
      setPage(initialData.page || 1);
      setLoading(false);
    }
  }, [initialData]);

  /* ================= CLIENT FETCH ================= */

  const fetchAstrologers = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
          ...(search && { search }),
        });

        const res = await fetch(`/api/landing/astro?${params.toString()}`, {
          signal,
        });

        const data: ApiResponse = await res.json();

        setAstrologers(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Failed to fetch astrologers:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [page, search],
  );

  useEffect(() => {
    // Skip first render (already SSR data)
    if (page === initialData?.page && search === "") return;

    const controller = new AbortController();
    fetchAstrologers(controller.signal);

    return () => controller.abort();
  }, [fetchAstrologers]);

  /* ================= HELPERS ================= */

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const getStatusChip = (status: string | null) => {
    if (!status) return null;
    const s = status.toLowerCase();

    // Common styling classes
    const baseClasses = "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border";

    if (s === "online" || s === "available") {
      return (
        <span className={`${baseClasses} border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400`}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </span>
          Online
        </span>
      );
    }

    if (s === "busy") {
      return (
        <span className={`${baseClasses} border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-400`}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Busy
        </span>
      );
    }

    return (
      <span className={`${baseClasses} border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400`}>
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        Offline
      </span>
    );
  };

  /* ================= UI ================= */

  return (
    <LandingWrapper>
      <main id="main-content" className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
        
        {/* === Hero Section === */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-10 sm:pt-32 sm:pb-14 lg:px-8">
          
          {/* Background Effects */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.15) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
            {/* Gradient Blobs */}
            <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-200/20 blur-[100px] filter dark:bg-orange-900/10" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex justify-center"
            >
              <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/40 bg-white/50 px-3 py-1 text-[11px] font-bold tracking-wider text-orange-600 shadow-sm backdrop-blur-md dark:border-orange-900/40 dark:bg-white/5 dark:text-orange-400 sm:px-4 sm:py-1.5 sm:text-xs">
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                TOP RATED EXPERTS
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
            >
              Consult with 
              <span className="block bg-gradient-to-r from-[#FF6B35] to-[#FF9F2E] bg-clip-text text-transparent sm:inline sm:pl-2">
                Vedic Astrologers
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg"
            >
              Get accurate predictions regarding your Future, Career, Love Life, and Health from <span className="font-semibold text-gray-900 dark:text-white">{total}+ verified experts</span>.
            </motion.p>

            {/* Search Bar - Responsive */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mx-auto max-w-xl"
            >
              <div className="relative group">
                <div className="pointer-events-none absolute inset-0 -inset-x-1 rounded-2xl bg-gradient-to-r from-[#FF6B35]/20 to-[#FF9F2E]/20 blur-lg transition-opacity opacity-50 group-hover:opacity-100" />
                <div className="relative flex items-center rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg shadow-orange-900/5 transition-all focus-within:ring-2 focus-within:ring-[#FF6B35]/20 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex h-10 w-10 items-center justify-center text-gray-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    // text-base prevents iOS zoom on focus
                    className="flex-1 bg-transparent px-1 py-2 text-base font-medium text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                    placeholder="Search name, language, or skill..."
                  />
                  {searchInput && (
                    <button onClick={clearSearch} className="p-2 text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={handleSearch}
                    className="hidden rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 sm:block"
                  >
                    Search
                  </button>
                  {/* Mobile Search Button Icon */}
                  <button
                    onClick={handleSearch}
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md sm:hidden"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* === Main Content Grid === */}
        <section className="px-3 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            
            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-48 animate-pulse rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:h-56">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : astrologers.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white/50 px-4 py-20 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <div className="mb-4 rounded-full bg-orange-50 p-4 dark:bg-orange-900/20">
                  <Filter className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Astrologers Found</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  We couldn't find any experts matching "{search}"
                </p>
                <button
                  onClick={clearSearch}
                  className="mt-6 font-semibold text-[#FF6B35] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Result Count Mobile */}
                <div className="mb-4 flex items-center justify-between px-1 sm:hidden">
                  <span className="text-xs font-semibold text-gray-500">{total} Astrologers</span>
                  <div className="h-px flex-1 bg-gray-200 ml-4 dark:bg-gray-700"></div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {astrologers.map((astro, index) => (
                    <motion.div
                      key={astro.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "50px" }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link href={`/talk-to-astrologers/${astro.slug}`} className="group block h-full">
                        <article className="relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:border-gray-800 dark:bg-gray-800 dark:hover:border-gray-700 sm:p-5">
                          
                          {/* Card Header: Avatar + Main Info */}
                          <div className="mb-3 flex gap-3 sm:gap-4">
                            {/* Avatar Section */}
                            <div className="relative shrink-0">
                              <div className="relative h-[68px] w-[68px] overflow-hidden rounded-full border-2 border-white shadow-md ring-1 ring-gray-100 dark:border-gray-700 dark:ring-gray-800 sm:h-[72px] sm:w-[72px]">
                                <Image
                                  src={avatar(astro.profileImage || "")}
                                  alt={astro.name}
                                  fill
                                  sizes="72px"
                                  unoptimized={true} 
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              </div>
                              {/* Top Badge Absolute */}
                              {astro.badges?.top_badge && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF9F2E] px-2 py-0.5 text-[8px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-800">
                                  TOP RATED
                                </div>
                              )}
                            </div>

                            {/* Name & Basic Info */}
                            <div className="flex min-w-0 flex-1 flex-col justify-center">
                              <div className="flex items-center justify-between">
                                <h2 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white sm:text-lg">
                                  {astro.name}
                                </h2>
                                {astro.isVerified && (
                                  <CheckCircle2 className="ml-1 h-4 w-4 text-blue-500" fill="currentColor" color="white" />
                                )}
                              </div>
                              
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  {astro.experienceInYears} Yrs Exp
                                </span>
                              </div>

                              {/* Status Chip (Mobile/Desktop unified location) */}
                              <div className="mt-2">
                                {getStatusChip(astro.chatStatus || astro.callStatus)}
                              </div>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="flex-1 space-y-3">
                            {/* Skills - Wrapped properly */}
                            <div className="flex flex-wrap gap-1.5">
                              {astro.allSkill && astro.allSkill.split(",").slice(0, 4).map((skill, idx) => (
                                <span 
                                  key={idx} 
                                  className="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-medium text-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                              {astro.allSkill && astro.allSkill.split(",").length > 4 && (
                                <span className="rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                  +{astro.allSkill.split(",").length - 4}
                                </span>
                              )}
                            </div>

                            {/* Languages */}
                            <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <Languages className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span className="line-clamp-1 break-all">
                                {astro.languageKnown.replace(/,/g, ", ")}
                              </span>
                            </div>
                            
                            {/* Bio */}
                            {astro.loginBio && (
                              <p className="line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                {astro.loginBio}
                              </p>
                            )}
                          </div>

                          {/* Separator */}
                          <div className="my-3 h-px w-full bg-gray-100 dark:bg-gray-700" />

                          {/* Card Footer: Stats & Action */}
                          <div className="flex items-center justify-between">
                            {/* Ratings & Followers */}
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {astro.avgRating ? astro.avgRating.toFixed(1) : "New"}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                        ({astro.reviewCount})
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <Users className="h-3 w-3" />
                                    {astro.followerCount > 1000 
                                        ? `${(astro.followerCount/1000).toFixed(1)}k` 
                                        : astro.followerCount} 
                                </div>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                                <div className="flex items-baseline justify-end gap-1">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        ₹{astro.charge}
                                    </span>
                                    <span className="text-[10px] text-gray-500">/min</span>
                                </div>
                                {astro.videoCallRate && (
                                    <p className="text-[9px] text-gray-400">Video: ₹{astro.videoCallRate}/m</p>
                                )}
                            </div>
                          </div>

                        </article>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* === Pagination === */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Previous
                      </button>

                      <div className="hidden items-center gap-1 sm:flex">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) pageNum = i + 1;
                          else if (page <= 3) pageNum = i + 1;
                          else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                          else pageNum = page - 2 + i;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`h-10 w-10 rounded-xl text-sm font-medium transition-all ${
                                page === pageNum
                                  ? "bg-[#FF6B35] text-white shadow-md"
                                  : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Mobile Page Indicator */}
                      <span className="flex h-10 items-center px-2 text-sm font-medium text-gray-600 dark:text-gray-400 sm:hidden">
                        Page {page} of {totalPages}
                      </span>

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </LandingWrapper>
  );
}