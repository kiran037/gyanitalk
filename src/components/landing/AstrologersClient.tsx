"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import { motion, useReducedMotion } from "framer-motion";
import type { KeyboardEvent } from "react";
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

    if (s === "online" || s === "available") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Online
        </span>
      );
    }

    if (s === "busy") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Busy
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800/80 dark:text-gray-300">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        Offline
      </span>
    );
  };

  /* ================= UI (UNCHANGED) ================= */

  return (
    <LandingWrapper>
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative flex min-h-[42vh] items-center justify-center overflow-hidden px-4 pb-6 pt-24 sm:min-h-[45vh] sm:px-6 sm:pb-8 sm:pt-28 lg:px-8">
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

          {/* Floating Particles (reduced for performance on low-end / reduced motion) */}
          {!prefersReducedMotion &&
            [...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.12, 0.35, 0.12],
                  scale: [1, 1.6, 1],
                  x: [0, Math.random() * 60 - 30, 0],
                  y: [0, Math.random() * 60 - 30, 0],
                }}
                transition={{
                  duration: 10 + i * 1.2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${5 + (i % 4) * 25}%`,
                  top: `${10 + Math.floor(i / 4) * 30}%`,
                }}
              >
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] opacity-60 blur-[2px]" />
                  <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] opacity-25" />
                </div>
              </motion.div>
            ))}

          {/* Gradient Orbs */}
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute -left-1/4 top-1/4 h-80 w-80 rounded-full bg-[#FF6B35] opacity-20 mix-blend-multiply blur-3xl filter dark:opacity-10 sm:h-96 sm:w-96"
                animate={{
                  scale: [1, 1.15, 1],
                  x: [0, 40, 0],
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -right-1/4 top-1/3 h-80 w-80 rounded-full bg-[#FFB347] opacity-20 mix-blend-multiply blur-3xl filter dark:opacity-10 sm:h-96 sm:w-96"
                animate={{
                  scale: [1, 1.2, 1],
                  x: [0, -30, 0],
                  y: [0, 40, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
              />
            </>
          )}

          <div className="relative z-10 mx-auto w-full max-w-7xl text-center">
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2">
                <TrendingUp className="h-3.5 w-3.5 text-[#FF6B35] sm:h-4 sm:w-4" />
                <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                  TOP ASTROLOGERS
                </span>
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-gray-900 dark:text-white">Meet Our </span>
                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  Expert Astrologers
                </span>
              </h1>

              <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
                Connect with{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {total}
                </span>{" "}
                + verified astrologers for personalized guidance.
              </p>

              {/* Search Bar */}
              <div className="mx-auto max-w-2xl">
                <div className="relative">
                  <label htmlFor="astro-search" className="sr-only">
                    Search astrologers
                  </label>
                  <input
                    id="astro-search"
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Search by name, skill, or language..."
                    className="w-full rounded-xl border border-gray-200/70 bg-white/70 px-4 py-3 pr-11 text-sm text-gray-900 backdrop-blur-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700/70 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 sm:px-5 sm:py-3.5 sm:pr-12 sm:text-base"
                  />
                  {searchInput ? (
                    <button
                      aria-label="Clear search"
                      onClick={clearSearch}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSearch}
                      aria-label="Search astrologers"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] p-1.5 text-white transition-all hover:scale-105 sm:p-2"
                    >
                      <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto w-full">
            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-[140px] animate-pulse overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:h-[150px]"
                  >
                    <div className="space-y-3 p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-14 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 sm:h-16 sm:w-16" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                          <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : astrologers.length === 0 ? (
              <motion.div
                className="rounded-2xl border border-gray-200/60 bg-white/70 py-14 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:py-16"
                initial={{
                  opacity: 0,
                  scale: prefersReducedMotion ? 1 : 0.95,
                }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <BookOpen className="mx-auto mb-4 h-14 w-14 text-gray-300 dark:text-gray-600 sm:h-16 sm:w-16" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                  No Astrologers Found
                </h3>
                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                  Try adjusting your search terms or filters.
                </p>
                <motion.button
                  onClick={clearSearch}
                  className="rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-5 py-2.5 text-sm font-medium text-white shadow-lg sm:px-6 sm:py-3 sm:text-base"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
                >
                  Clear Search
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Astrologers Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  {astrologers.map((astro, index) => (
                    <motion.div
                      key={astro.id}
                      initial={{
                        opacity: 0,
                        y: prefersReducedMotion ? 0 : 20,
                      }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                    >
                      <Link
                        href={`/landing/astro/${astro.slug}`}
                        className="group block h-full"
                      >
                        <motion.article
                          className="relative flex h-full flex-col rounded-xl border border-gray-200/60 bg-white/70 p-3.5 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-4"
                          whileHover={
                            prefersReducedMotion
                              ? {}
                              : {
                                  scale: 1.02,
                                  borderColor: "rgba(255, 107, 53, 0.5)",
                                  boxShadow:
                                    "0 10px 30px rgba(255, 107, 53, 0.15)",
                                }
                          }
                          transition={{ duration: 0.18 }}
                        >
                          <div className="mb-3 flex gap-3">
                            {/* Avatar + TOP Badge */}
                            <div className="relative flex-shrink-0">
                              {astro.badges?.top_badge && (
                                <div className="absolute -right-1.5 -top-1.5 z-10 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md">
                                  <Award className="h-2.5 w-2.5" />
                                  <span>TOP</span>
                                </div>
                              )}
                              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full sm:h-16 sm:w-16">
                                <Image
                                  src={avatar(astro.profileImage || "")}
                                  alt={astro.name}
                                  fill
                                  sizes="(max-width: 640px) 56px, 64px"
                                  className="object-cover"
                                  priority={false}
                                />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              {/* Name + Verified + Status */}
                              <div className="mb-1.5 flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <h2 className="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white sm:text-base">
                                    {astro.name}
                                  </h2>
                                  {astro.isVerified && (
                                    <span className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#FF6B35] to-[#FFB347] text-[9px] font-bold text-white shadow-sm">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <div className="hidden sm:block">
                                  {getStatusChip(
                                    astro.chatStatus || astro.callStatus,
                                  )}
                                </div>
                              </div>

                              {/* Skills */}
                              <div className="mb-1.5 flex flex-wrap gap-1">
                                {astro.allSkill &&
                                  astro.allSkill
                                    .split(",")
                                    .slice(0, 2)
                                    .map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="rounded bg-[#FF6B35]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#FF6B35]"
                                      >
                                        {skill.trim()}
                                      </span>
                                    ))}
                              </div>

                              {/* Meta Row: Exp + Lang + Country */}
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{astro.experienceInYears}y exp.</span>
                                </div>
                                {astro.languageKnown && (
                                  <div className="flex items-center gap-1">
                                    <Languages className="h-3 w-3" />
                                    <span className="max-w-[80px] truncate">
                                      {astro.languageKnown
                                        .split(",")
                                        .slice(0, 2)
                                        .join(", ")}
                                    </span>
                                  </div>
                                )}
                                {astro.country && (
                                  <span className="hidden rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800/80 dark:text-gray-300 sm:inline-flex">
                                    {astro.country}
                                  </span>
                                )}
                              </div>

                              {/* Small status chip for mobile under meta row */}
                              <div className="mt-1 sm:hidden">
                                {getStatusChip(
                                  astro.chatStatus || astro.callStatus,
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Bio / tagline */}
                          {astro.loginBio && (
                            <p className="mb-2 line-clamp-2 text-[11px] text-gray-600 dark:text-gray-400 sm:text-xs">
                              {astro.loginBio}
                            </p>
                          )}

                          {/* Followers / Earnings (optional small stats row) */}
                          <div className="mb-2 flex items-center justify-between text-[10px] text-gray-500 sm:text-[11px]">
                            <span>
                              {astro.followerCount.toLocaleString()} followers
                            </span>
                            {astro.monthlyEarning && (
                              <span>
                                Est. ₹{astro.monthlyEarning}
                                <span className="hidden sm:inline">/month</span>
                              </span>
                            )}
                          </div>

                          {/* Bottom Row - Rating & Price */}
                          <div className="mt-auto flex items-center justify-between border-t border-gray-200/60 pt-2.5 dark:border-gray-700/60 sm:pt-3">
                            <div className="flex items-center gap-1.5">
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                                {astro.avgRating
                                  ? astro.avgRating.toFixed(1)
                                  : "New"}
                              </span>
                              <span className="text-[10px] text-gray-500 sm:text-xs">
                                ({astro.reviewCount})
                              </span>
                            </div>

                            <div className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                              ₹{astro.charge}
                              <span className="text-[10px] font-normal text-gray-500 sm:text-xs">
                                /min
                              </span>
                            </div>
                          </div>
                        </motion.article>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Stats Bar */}
                {total > 0 && (
                  <motion.div
                    className="mt-7 border-t border-gray-200/60 pt-5 dark:border-gray-700/60 sm:mt-8 sm:pt-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                        Showing{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {astrologers.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {total}
                        </span>{" "}
                        astrologers
                      </p>
                      {search && (
                        <button
                          aria-label="Clear search"
                          onClick={clearSearch}
                          className="text-xs font-medium text-[#FF6B35] transition-colors hover:text-[#FF6B35]/80 sm:text-sm"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    className="mt-7 flex items-center justify-center gap-2 sm:mt-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <motion.button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-xl border border-gray-200/60 bg-white/70 px-3.5 py-2 text-xs font-medium text-gray-700 backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300 sm:px-4 sm:text-sm"
                      whileHover={
                        page === 1 || prefersReducedMotion
                          ? {}
                          : { scale: 1.05 }
                      }
                      whileTap={
                        page === 1 || prefersReducedMotion
                          ? {}
                          : { scale: 0.95 }
                      }
                    >
                      Previous
                    </motion.button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
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
                            <motion.button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`h-8 w-8 rounded-xl text-xs font-medium transition-all sm:h-10 sm:w-10 sm:text-sm ${
                                page === pageNum
                                  ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                  : "border border-gray-200/60 bg-white/70 text-gray-700 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
                              }`}
                              whileHover={
                                prefersReducedMotion ? {} : { scale: 1.1 }
                              }
                              whileTap={
                                prefersReducedMotion ? {} : { scale: 0.9 }
                              }
                            >
                              {pageNum}
                            </motion.button>
                          );
                        },
                      )}
                    </div>

                    <motion.button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="rounded-xl border border-gray-200/60 bg-white/70 px-3.5 py-2 text-xs font-medium text-gray-700 backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300 sm:px-4 sm:text-sm"
                      whileHover={
                        page === totalPages || prefersReducedMotion
                          ? {}
                          : { scale: 1.05 }
                      }
                      whileTap={
                        page === totalPages || prefersReducedMotion
                          ? {}
                          : { scale: 0.95 }
                      }
                    >
                      Next
                    </motion.button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </LandingWrapper>
  );
}
