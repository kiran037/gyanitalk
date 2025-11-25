"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { Search, Star, Clock, Languages, Award, X, MapPin, TrendingUp, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import Head from "next/head";
import { motion } from "framer-motion";

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

    useEffect(() => {
        // Add verified badge styles
        const style = document.createElement('style');
        style.textContent = `
            .verified-badge {
                position: relative;
                display: inline-block;
                width: 16px;
                height: 16px;
                flex-shrink: 0;
            }
            .verified-badge:before,
            .verified-badge:after {
                content: "\\2713";
                color: white;
                font-size: 10px;
                font-weight: bold;
                text-align: center;
                vertical-align: middle;
                position: absolute;
                top: 0;
                left: 0;
                display: inline-block;
                width: 16px;
                height: 16px;
                line-height: 16px;
                background: #FF6B35;
                border-radius: 20%;
            }
            .verified-badge:before {
                transform: rotate(45deg);
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        fetchAstrologers();
    }, [page, search]);

    useEffect(() => {
        if (pageSEO) {
            document.title = pageSEO.title;

            const updateMetaTag = (name: string, content: string, isProperty = false) => {
                const attribute = isProperty ? 'property' : 'name';
                let element = document.querySelector(`meta[${attribute}="${name}"]`);
                if (!element) {
                    element = document.createElement('meta');
                    element.setAttribute(attribute, name);
                    document.head.appendChild(element);
                }
                element.setAttribute('content', content);
            };

            updateMetaTag('description', pageSEO.description);
            updateMetaTag('keywords', pageSEO.keywords);

            let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.rel = 'canonical';
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.href = `${window.location.origin}${pageSEO.canonical}`;

            let structuredDataScript = document.querySelector('script[type="application/ld+json"]#page-structured-data') as HTMLScriptElement;
            if (!structuredDataScript) {
                structuredDataScript = document.createElement('script');
                structuredDataScript.type = 'application/ld+json';
                structuredDataScript.id = 'page-structured-data';
                document.head.appendChild(structuredDataScript);
            }
            structuredDataScript.textContent = JSON.stringify(pageSEO.structuredData);
        }
    }, [pageSEO]);

    const fetchAstrologers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "12",
                ...(search && { search })
            });
            const res = await fetch(`/api/landing/astro?${params}`);
            const data: ApiResponse = await res.json();
            setAstrologers(data.data || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 0);
            setPageSEO(data.seo || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    return (
        <>
            <Head>
                <title>{pageSEO?.title || "Top Verified Astrologers Online | Expert Astrology Consultation"}</title>
                <meta name="description" content={pageSEO?.description || "Connect with verified astrologers for personalized guidance."} />
                <meta name="keywords" content={pageSEO?.keywords || "astrologers, online astrology, best astrologers"} />
            </Head>

            <LandingWrapper>
                {/* Hero Section */}
                <section className="relative min-h-[45vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-28 pb-8">
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                        }} />
                    </div>

                    {/* Floating Particles */}
                    {[...Array(12)].map((_, i) => (
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
                                ease: "easeInOut"
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

                    {/* Gradient Orbs */}
                    <motion.div 
                        className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
                        animate={{
                            scale: [1, 1.2, 1],
                            x: [0, 50, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div 
                        className="absolute top-1/3 -right-1/4 w-96 h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
                        animate={{
                            scale: [1, 1.3, 1],
                            x: [0, -30, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />

                    <div className="relative z-10 max-w-7xl mx-auto w-full text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm">
                                <TrendingUp className="w-4 h-4 text-[#FF6B35]" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">TOP ASTROLOGERS</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                                <span className="text-gray-900 dark:text-white">Meet Our </span>
                                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Expert Astrologers</span>
                            </h1>

                            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                                Connect with {total}+ verified astrologers for personalized guidance
                            </p>

                            {/* Search Bar */}
                            <div className="max-w-2xl mx-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Search by name, skill, or language..."
                                        className="w-full px-5 py-3.5 pr-12 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                    {searchInput ? (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-400" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-lg transition-all hover:scale-105"
                                        >
                                            <Search className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="w-full mx-auto">
                        {/* Loading State */}
                        {loading ? (
                            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden animate-pulse h-[140px]">
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                                                <div className="flex-1 space-y-2 min-w-0">
                                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : astrologers.length === 0 ? (
                            <motion.div 
                                className="text-center py-16 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Astrologers Found</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search</p>
                                <motion.button
                                    onClick={clearSearch}
                                    className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white font-medium rounded-xl shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Clear Search
                                </motion.button>
                            </motion.div>
                        ) : (
                            <>
                                {/* Astrologers Grid - Compact Mobile View */}
                                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {astrologers.map((astro, index) => (
                                        <motion.div
                                            key={astro.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                        >
                                            <Link href={`/landing/astro/${astro.slug}`} className="group block h-full">
                                                <motion.article 
                                                    className="relative bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4 h-full flex flex-col"
                                                    whileHover={{ 
                                                        scale: 1.02,
                                                        borderColor: "rgba(255, 107, 53, 0.5)",
                                                        boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)"
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className="flex gap-3 mb-3">
                                                        {/* Avatar with Top Badge */}
                                                        <div className="flex-shrink-0 relative">
                                                            {/* Top Badge - Attached to Profile */}
                                                            {astro.badges?.top_badge && (
                                                                <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-[9px] font-bold rounded-full flex items-center gap-0.5 z-10 shadow-md">
                                                                    <Award className="w-2 h-2" />
                                                                    <span>TOP</span>
                                                                </div>
                                                            )}
                                                            <div className="relative w-16 h-16">
                                                                <img
                                                                    src={avatar(astro.profileImage)}
                                                                    alt={astro.name}
                                                                    className="w-full h-full rounded-full object-cover ring-2 ring-gray-200/60 dark:ring-gray-700/60 group-hover:ring-[#FF6B35]/50 transition-all"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* Name & Verified */}
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <h2 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-[#FF6B35] transition-colors">
                                                                    {astro.name}
                                                                </h2>
                                                                {astro.isVerified && (
                                                                    <span className="verified-badge flex-shrink-0"></span>
                                                                )}
                                                            </div>

                                                            {/* Skills */}
                                                            <div className="flex flex-wrap gap-1 mb-2">
                                                                {astro.allSkill && astro.allSkill.split(',').slice(0, 2).map((skill, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-1.5 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] text-[10px] font-medium rounded"
                                                                    >
                                                                        {skill.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>

                                                            {/* Meta Info - Compact */}
                                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>{astro.experienceInYears}y</span>
                                                                </div>
                                                                {astro.languageKnown && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Languages className="w-3 h-3" />
                                                                        <span className="truncate max-w-[80px]">
                                                                            {astro.languageKnown.split(',')[0]}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bottom Row - Rating & Price */}
                                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                                {astro.avgRating ? astro.avgRating.toFixed(1) : 'New'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                ({astro.reviewCount})
                                                            </span>
                                                        </div>

                                                        <div className="text-base font-bold text-gray-900 dark:text-white">
                                                            ₹{astro.charge}
                                                            <span className="text-xs font-normal text-gray-500">/min</span>
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
                                        className="mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-700/60"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Showing <span className="font-medium text-gray-900 dark:text-white">{astrologers.length}</span> of{" "}
                                                <span className="font-medium text-gray-900 dark:text-white">{total}</span> astrologers
                                            </p>
                                            {search && (
                                                <button
                                                    onClick={clearSearch}
                                                    className="text-sm text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium transition-colors"
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
                                        className="mt-8 flex justify-center items-center gap-2"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                    >
                                        <motion.button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
                                            whileHover={{ scale: page === 1 ? 1 : 1.05 }}
                                            whileTap={{ scale: page === 1 ? 1 : 0.95 }}
                                        >
                                            Previous
                                        </motion.button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                                                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                                                            page === pageNum
                                                                ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                                                : "bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 backdrop-blur-sm"
                                                        }`}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {pageNum}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        <motion.button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm"
                                            whileHover={{ scale: page === totalPages ? 1 : 1.05 }}
                                            whileTap={{ scale: page === totalPages ? 1 : 0.95 }}
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