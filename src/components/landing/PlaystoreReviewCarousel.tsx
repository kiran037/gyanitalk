"use client";

import { Star, ThumbsUp, Calendar } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Review {
    id: string;
    user: {
        name: string;
        avatar: string | null;
    };
    rating: number;
    comment: string;
    replyText: string | null;
    replyDate: string | null;
    thumbsUp: number;
    date: string;
    version: string | null;
    dateFormatted: string | null;
}

const defaultAvatar = "/default-avatar.svg";

export default function PlaystoreReviewCarousel() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [avgRating, setAvgRating] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        let cancelled = false;

        const fetchReviews = async () => {
            try {
                const res = await fetch("/api/landing/playstorereview?num=30&sort=RATING");
                const data = await res.json();

                if (!cancelled && data?.success) {
                    setReviews(data.reviews || []);
                    setAvgRating(data.avgRating || 0);
                    setTotal(data.total || 0);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to fetch reviews:", err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchReviews();
        return () => {
            cancelled = true;
        };
    }, []);

    // Duplicate list once for seamless loop
    const trackReviews = useMemo(
        () => (reviews.length ? [...reviews, ...reviews] : []),
        [reviews]
    );

    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

    const scrollDuration = Math.max(
        isMobile ? 80 : 60,
        reviews.length * (isMobile ? 7 : 6)
    );

    if (loading) {
        return (
            <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8 sm:mb-10">
                        <div className="h-5 w-40 max-w-full bg-gray-200 dark:bg-neutral-900 rounded mx-auto mb-3 animate-pulse" />
                        <div className="h-8 w-60 max-w-full bg-gray-200 dark:bg-neutral-900 rounded mx-auto animate-pulse" />
                    </div>
                </div>
            </section>
        );
    }

    if (!reviews.length) return null;

    // Animation duration scales with count but has sane min/max
    const baseDuration = Math.max(18, Math.min(40, reviews.length * 2));

    return (
        <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-green-50/60 to-blue-50/60 dark:from-white/[0.02] dark:to-white/[0.02] overflow-x-hidden">
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-10 sm:mb-14"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-block mb-3 sm:mb-4">
                        <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#FF6B35]">
                            TRUSTED BY THOUSANDS
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
                        <span className="text-gray-900 dark:text-white">User </span>
                        <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                            Reviews
                        </span>
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto px-2">
                        See what our users are saying about their experience
                    </p>
                    {total > 0 && (
                        <p className="mt-2 text-[11px] sm:text-xs text-gray-500 dark:text-gray-500">
                            ⭐ {Number(avgRating ?? 0).toFixed(1)} avg rating · {total}+ reviews
                        </p>
                    )}
                </motion.div>
            </div>

            {/* Marquee container */}
            <div className="relative w-full overflow-hidden">
                <motion.div
                    className="inline-flex gap-3 sm:gap-4 md:gap-5 py-2 whitespace-nowrap will-change-transform"
                    animate={
                        shouldReduceMotion
                            ? {}
                            : { x: ["0%", "-50%"] }
                    }
                    transition={
                        shouldReduceMotion
                            ? undefined
                            : {
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: scrollDuration, // <-- USE THIS
                                    ease: "linear",
                                },
                            }
                    }
                >
                    {trackReviews.map((review, index) => {
                        const displayDate =
                            review.dateFormatted ||
                            new Date(review.date).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                            });

                        return (
                            <div
                                key={`${review.id}-${index}`}
                                className="flex-shrink-0 w-[260px] xs:w-[280px] sm:w-[320px] md:w-[360px] group inline-block"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-850 dark:to-black rounded-2xl overflow-hidden h-full shadow-md sm:shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-800 hover:border-[#FF6B35]/50 dark:hover:border-[#FF6B35]/50 transition-all p-4 sm:p-5">
                                        {/* User Header */}
                                        <div className="flex items-start gap-3 mb-3 sm:mb-4">
                                            <img
                                                src={review.user.avatar || `${defaultAvatar}${review.user.name}`}
                                                alt={review.user.name}
                                                loading="lazy"
                                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                                                    {review.user.name}
                                                </h3>

                                                {/* Rating Stars */}
                                                <div className="flex items-center gap-0.5 mt-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < review.rating
                                                                ? "text-yellow-500 fill-yellow-500"
                                                                : "text-gray-300 dark:text-gray-600"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Date Badge */}
                                            <div className="flex flex-col items-end gap-0.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{displayDate}</span>
                                                </span>
                                                {review.version && (
                                                    <span className="px-1.5 py-0.5 bg-gray-50 dark:bg-gray-900 rounded text-[9px] text-gray-500">
                                                        v{review.version}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Review Comment */}
                                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-4 leading-relaxed mb-3 sm:mb-4">
                                            {review.comment}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                            {review.thumbsUp > 0 ? (
                                                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                                    <ThumbsUp className="w-3.5 h-3.5 text-[#FF6B35]" />
                                                    <span className="font-medium">{review.thumbsUp} helpful</span>
                                                </div>
                                            ) : (
                                                <div className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                                                    Google Play Review
                                                </div>
                                            )}
                                        </div>

                                        {/* Developer Reply */}
                                        {review.replyText && (
                                            <div className="mt-3 p-2.5 sm:p-3 bg-orange-50 dark:bg-orange-900/15 rounded-lg border border-orange-200 dark:border-orange-800">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] flex items-center justify-center">
                                                        <span className="text-white text-[10px] font-bold">GT</span>
                                                    </div>
                                                    <span className="text-[10px] sm:text-xs font-semibold text-gray-900 dark:text-white">
                                                        Developer Response
                                                    </span>
                                                </div>
                                                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {review.replyText}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}