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
    const [avgRating, setAvgRating] = useState(0);
    const [total, setTotal] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    const shouldReduceMotion = useReducedMotion();

    // ✅ Safe viewport detection
    useEffect(() => {
        const update = () => setIsMobile(window.innerWidth < 640);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch("/api/landing/playstorereview?num=30&sort=RATING");
                const data = await res.json();

                if (!cancelled && data?.success) {
                    setReviews(data.reviews || []);
                    setAvgRating(Number(data.avgRating) || 0);
                    setTotal(data.total || 0);
                }
            } catch (e) {
                console.error("Failed to fetch reviews:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const trackReviews = useMemo(
        () => (reviews.length ? [...reviews, ...reviews] : []),
        [reviews]
    );

    const scrollDuration = Math.max(
        isMobile ? 80 : 60,
        reviews.length * (isMobile ? 7 : 6)
    );

    if (loading) {
        return (
            <section className="py-12 sm:py-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="h-5 w-40 bg-gray-200 dark:bg-neutral-900 rounded mx-auto mb-3 animate-pulse" />
                    <div className="h-8 w-60 bg-gray-200 dark:bg-neutral-900 rounded mx-auto animate-pulse" />
                </div>
            </section>
        );
    }

    if (!reviews.length) return null;

    return (
        <section
            aria-labelledby="playstore-reviews-heading"
            className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-green-50/60 to-blue-50/60 dark:from-white/[0.02] dark:to-white/[0.02] overflow-x-hidden"
        >
            <h2 id="playstore-reviews-heading" className="sr-only">
                User reviews from Google Play
            </h2>

            {/* Header */}
            <div className="text-center mb-10 sm:mb-14 px-4">
                <span className="text-xs font-semibold uppercase text-[#FF6B35]">
                    Trusted by Thousands
                </span>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    ⭐ {avgRating.toFixed(1)} average · {total}+ reviews
                </p>
            </div>

            {/* Marquee */}
            <div className="relative w-full overflow-hidden">
                <motion.div
                    className="inline-flex gap-4 py-2 whitespace-nowrap will-change-transform"
                    animate={
                        shouldReduceMotion ? {} : { x: ["0%", "-50%"] }
                    }
                    transition={
                        shouldReduceMotion
                            ? undefined
                            : {
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: scrollDuration,
                                    ease: "linear",
                                },
                            }
                    }
                >
                    {trackReviews.map((review, index) => (
                        <article
                            key={`${review.id}-${index}`}
                            className="w-[280px] sm:w-[320px] md:w-[360px] flex-shrink-0"
                        >
                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-800 h-full">
                                {/* Header */}
                                <div className="flex items-start gap-3 mb-3">
                                    <img
                                        src={review.user.avatar || defaultAvatar}
                                        alt={review.user.name}
                                        loading="lazy"
                                        decoding="async"
                                        referrerPolicy="no-referrer"
                                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                            {review.user.name}
                                        </p>
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    aria-hidden="true"
                                                    className={`w-3 h-3 ${i < review.rating
                                                            ? "text-yellow-500 fill-yellow-500"
                                                            : "text-gray-300 dark:text-gray-600"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                                        <Calendar aria-hidden="true" className="w-3 h-3" />
                                        {review.dateFormatted ??
                                            new Date(review.date).toLocaleDateString("en-US", {
                                                month: "short",
                                                year: "numeric",
                                            })}
                                    </span>
                                </div>

                                {/* Comment */}
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 mb-3">
                                    {review.comment}
                                </p>

                                {/* Footer */}
                                {review.thumbsUp > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <ThumbsUp aria-hidden="true" className="w-3 h-3 text-[#FF6B35]" />
                                        {review.thumbsUp} helpful
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}