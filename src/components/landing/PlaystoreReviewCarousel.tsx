"use client";

import { Star, ThumbsUp, Calendar, Quote, Sparkles, User } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

// --- Types ---
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

const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"; // Generic fallback

export default function PlaystoreReviewCarousel() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [avgRating, setAvgRating] = useState(0);
    const [total, setTotal] = useState(0);
    
    // Animation controls
    const shouldReduceMotion = useReducedMotion();
    const [isPaused, setIsPaused] = useState(false);

    // --- Fetch Data ---
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
        return () => { cancelled = true; };
    }, []);

    // --- Memoized Track ---
    // Duplicate list for seamless infinite loop
    const trackReviews = useMemo(
        () => (reviews.length ? [...reviews, ...reviews] : []),
        [reviews]
    );

    // Dynamic speed based on content length
    const duration = Math.max(40, reviews.length * 5);

    if (loading) return <LoadingSkeleton />;
    if (!reviews.length) return null;

    return (
        <section className="relative py-16 sm:py-24 bg-[#FFFBF5] dark:bg-[#080808] overflow-hidden">
            
            {/* 1. Background Decor (Cosmic Theme) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/50 via-transparent to-transparent dark:from-orange-900/10" />
                {/* Subtle Stars Pattern */}
                <svg className="absolute w-full h-full opacity-[0.03] dark:opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="review-stars" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="currentColor" className="text-gray-900 dark:text-white" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#review-stars)" />
                </svg>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 2. Header Section */}
                <motion.div 
                    className="text-center mb-12 sm:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-orange-100 dark:border-gray-700 shadow-sm mb-5">
                        <img src="/google-play-icon.svg" alt="Play Store" className="w-4 h-4" onError={(e) => e.currentTarget.style.display='none'} /> 
                        {/* Fallback if icon missing, just text */}
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                            Google Play Verified
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                        <span className="text-gray-900 dark:text-white">Cosmic </span>
                        <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                            Connections
                        </span>
                    </h2>
                    
                    {/* Rating Badge */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mt-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</span>
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? "fill-current" : "text-gray-300 dark:text-gray-700"}`} />
                                ))}
                            </div>
                        </div>
                        <span className="hidden sm:inline w-1 h-1 bg-gray-300 rounded-full" />
                        <p className="text-sm font-medium">Based on {total.toLocaleString()}+ Reviews</p>
                    </div>
                </motion.div>
            </div>

            {/* 3. Infinite Marquee */}
            <div 
                className="relative w-full overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                {/* Fade Edges */}
                <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-32 z-20 bg-gradient-to-r from-[#FFFBF5] to-transparent dark:from-[#080808] pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-32 z-20 bg-gradient-to-l from-[#FFFBF5] to-transparent dark:from-[#080808] pointer-events-none" />

                <div className="flex">
                    <motion.div
                        className="flex gap-5 sm:gap-6 px-4"
                        animate={shouldReduceMotion ? {} : { x: ["0%", "-50%"] }}
                        transition={
                            shouldReduceMotion
                                ? undefined
                                : { 
                                    repeat: Infinity, 
                                    ease: "linear", 
                                    duration: duration,
                                }
                        }
                        style={{
                            animationPlayState: isPaused ? "paused" : "running",
                        }}
                    >
                        {trackReviews.map((review, index) => (
                            <ReviewCard key={`${review.id}-${index}`} review={review} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// --- Review Card Component ---
function ReviewCard({ review }: { review: Review }) {
    return (
        <article className="w-[280px] sm:w-[350px] flex-shrink-0 group">
            <div className="h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300 flex flex-col relative">
                
                {/* Quote Icon Background */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-100 dark:text-gray-800 fill-current" />

                {/* User Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                        <img
                            src={review.user.avatar || defaultAvatar}
                            alt={review.user.name}
                            loading="lazy"
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                            onError={(e) => {
                                e.currentTarget.src = defaultAvatar;
                            }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-gray-900">
                            <Sparkles className="w-2 h-2 text-white fill-white" />
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                            {review.user.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {/* Stars */}
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-200 dark:text-gray-700"}`} 
                                    />
                                ))}
                            </div>
                            <span>•</span>
                            <span className="truncate">
                                {review.dateFormatted || new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Comment Body */}
                <div className="flex-1 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-4">
                        {review.comment}
                    </p>
                </div>

                {/* Footer Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800 mt-auto">
                    {review.version && (
                        <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                            v{review.version}
                        </span>
                    )}
                    
                    {review.thumbsUp > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <ThumbsUp className="w-3.5 h-3.5 text-[#FF6B35]" />
                            <span>{review.thumbsUp} Helpful</span>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

// --- Loading State ---
function LoadingSkeleton() {
    return (
        <section className="py-24 bg-[#FFFBF5] dark:bg-[#080808]">
            <div className="max-w-4xl mx-auto px-4 text-center mb-12">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4 animate-pulse" />
                <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto animate-pulse" />
            </div>
            <div className="flex gap-4 overflow-hidden px-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-[300px] h-[200px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex-shrink-0 animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-3 w-4/6 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}