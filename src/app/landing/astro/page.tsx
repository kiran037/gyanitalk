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
import Head from "next/head";
import { motion, useReducedMotion } from "framer-motion";
import type { KeyboardEvent } from "react";

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

export default function AstrologersListPage() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pageSEO, setPageSEO] = useState<PageSEO | null>(null);

  const prefersReducedMotion = useReducedMotion();

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
      setPageSEO(data.seo || null);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Failed to fetch astrologers:", err);
      }
    } finally {
      setLoading(false);
    }
  },
  [page, search]
);

useEffect(() => {
  const controller = new AbortController();

  fetchAstrologers(controller.signal);

  return () => {
    controller.abort();
  };
}, [fetchAstrologers]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const getStatusChip = (status: string | null) => {
    if (!status) return null;
    const normalized = status.toLowerCase();

    if (normalized === "online" || normalized === "available") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium dark:bg-emerald-900/20 dark:text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </span>
      );
    }

    if (normalized === "busy") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-medium dark:bg-amber-900/20 dark:text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Busy
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium dark:bg-gray-800/80 dark:text-gray-300">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        Offline
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>
          {pageSEO?.title ||
            "Top Verified Astrologers Online | Expert Astrology Consultation"}
        </title>
        <meta
          name="description"
          content={
            pageSEO?.description ||
            "Connect with verified astrologers for personalized guidance."
          }
        />
        <meta
          name="keywords"
          content={
            pageSEO?.keywords || "astrologers, online astrology, best astrologers"
          }
        />
        {pageSEO?.canonical && (
          <link rel="canonical" href={pageSEO.canonical} />
        )}
        {pageSEO?.structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(pageSEO.structuredData),
            }}
          />
        )}
      </Head>

      <LandingWrapper>
        {/* Hero Section */}
        <section className="relative min-h-[42vh] sm:min-h-[45vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-24 sm:pt-28 pb-6 sm:pb-8">
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
            [...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
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
                  <div className="w-2.5 h-2.5 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-[2px] opacity-60" />
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full animate-ping opacity-25" />
                </div>
              </motion.div>
            ))}

          {/* Gradient Orbs */}
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute top-1/4 -left-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
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
                className="absolute top-1/3 -right-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
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

          <div className="relative z-10 max-w-7xl mx-auto w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B35]" />
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  TOP ASTROLOGERS
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                <span className="text-gray-900 dark:text-white">
                  Meet Our{" "}
                </span>
                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  Expert Astrologers
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Connect with{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {total}
                </span>{" "}
                + verified astrologers for personalized guidance.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Search by name, skill, or language..."
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 pr-11 sm:pr-12 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  {searchInput ? (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSearch}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-lg transition-all hover:scale-105"
                    >
                      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
          <div className="w-full mx-auto">
            {/* Loading State */}
            {loading ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden animate-pulse h-[140px] sm:h-[150px]"
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : astrologers.length === 0 ? (
              <motion.div
                className="text-center py-14 sm:py-16 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl"
                initial={{
                  opacity: 0,
                  scale: prefersReducedMotion ? 1 : 0.95,
                }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <BookOpen className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Astrologers Found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search terms or filters.
                </p>
                <motion.button
                  onClick={clearSearch}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-sm sm:text-base font-medium rounded-xl shadow-lg"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
                >
                  Clear Search
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Astrologers Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                          className="relative bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-3.5 sm:p-4 h-full flex flex-col"
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
                          <div className="flex gap-3 mb-3">
                            {/* Avatar + TOP Badge */}
                            <div className="flex-shrink-0 relative">
                              {astro.badges?.top_badge && (
                                <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-[9px] font-bold rounded-full flex items-center gap-0.5 z-10 shadow-md">
                                  <Award className="w-2.5 h-2.5" />
                                  <span>TOP</span>
                                </div>
                              )}
                              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                                <img
                                  src={avatar(astro.profileImage || "")}
                                  alt={astro.name}
                                  className="w-full h-full rounded-full object-cover ring-2 ring-gray-200/60 dark:ring-gray-700/60 group-hover:ring-[#FF6B35]/60 transition-all"
                                  loading="lazy"
                                />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Name + Verified + Status */}
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-[#FF6B35] transition-colors">
                                    {astro.name}
                                  </h2>
                                  {astro.isVerified && (
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-md bg-gradient-to-br from-[#FF6B35] to-[#FFB347] text-[9px] font-bold text-white shadow-sm flex-shrink-0">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <div className="hidden sm:block">
                                  {getStatusChip(astro.chatStatus || astro.callStatus)}
                                </div>
                              </div>

                              {/* Skills */}
                              <div className="flex flex-wrap gap-1 mb-1.5">
                                {astro.allSkill &&
                                  astro.allSkill
                                    .split(",")
                                    .slice(0, 2)
                                    .map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="px-1.5 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] text-[10px] font-medium rounded"
                                      >
                                        {skill.trim()}
                                      </span>
                                    ))}
                              </div>

                              {/* Meta Row: Exp + Lang + Country */}
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{astro.experienceInYears}y exp.</span>
                                </div>
                                {astro.languageKnown && (
                                  <div className="flex items-center gap-1">
                                    <Languages className="w-3 h-3" />
                                    <span className="truncate max-w-[80px]">
                                      {astro.languageKnown.split(",").slice(0, 2).join(", ")}
                                    </span>
                                  </div>
                                )}
                                {astro.country && (
                                  <span className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800/80 dark:text-gray-300">
                                    {astro.country}
                                  </span>
                                )}
                              </div>

                              {/* Small status chip for mobile under meta row */}
                              <div className="mt-1 sm:hidden">
                                {getStatusChip(astro.chatStatus || astro.callStatus)}
                              </div>
                            </div>
                          </div>

                          {/* Bio / tagline */}
                          {astro.loginBio && (
                            <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {astro.loginBio}
                            </p>
                          )}

                          {/* Followers / Earnings (optional small stats row) */}
                          <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-gray-500 mb-2">
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
                          <div className="flex items-center justify-between mt-auto pt-2.5 sm:pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                                {astro.avgRating ? astro.avgRating.toFixed(1) : "New"}
                              </span>
                              <span className="text-[10px] sm:text-xs text-gray-500">
                                ({astro.reviewCount})
                              </span>
                            </div>

                            <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                              ₹{astro.charge}
                              <span className="text-[10px] sm:text-xs font-normal text-gray-500">
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
                    className="mt-7 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-200/60 dark:border-gray-700/60"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
                          onClick={clearSearch}
                          className="text-xs sm:text-sm text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium transition-colors"
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
                    className="mt-7 sm:mt-8 flex justify-center items-center gap-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <motion.button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3.5 sm:px-4 py-2 bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
                      whileHover={
                        page === 1 || prefersReducedMotion ? {} : { scale: 1.05 }
                      }
                      whileTap={
                        page === 1 || prefersReducedMotion ? {} : { scale: 0.95 }
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
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                                page === pageNum
                                  ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                  : "bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 backdrop-blur-sm"
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
                        }
                      )}
                    </div>

                    <motion.button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-3.5 sm:px-4 py-2 bg-white/70 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
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
      </LandingWrapper>
    </>
  );
}