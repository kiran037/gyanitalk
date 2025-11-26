"use client";

import { Star, ThumbsUp, Calendar, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

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

const defaultAvatar = "https://ui-avatars.com/api/?background=FF6B35&color=fff&name=";

export default function PlaystoreReviewCarousel() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [avgRating, setAvgRating] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
        fetch('/api/landing/playstorereview?num=30&sort=RATING')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setReviews(data.reviews || []);
                    setAvgRating(data.avgRating || 0);
                    setTotal(data.total || 0);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch reviews:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="h-6 w-48 bg-gray-200 dark:bg-neutral-950 rounded mx-auto mb-4 animate-pulse" />
                        <div className="h-12 w-96 bg-gray-200 dark:bg-neutral-950 rounded mx-auto animate-pulse" />
                    </div>
                </div>
            </section>
        );
    }

    if (reviews.length === 0) return null;

    return (
        <section className="relative py-16 sm:py-24 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-white/[0.02] dark:to-white/[0.02] overflow-x-hidden">

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-12 sm:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-block mb-4 sm:mb-6">
                        <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#FF6B35]">
                            TRUSTED BY THOUSANDS
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                        <span className="text-gray-900 dark:text-white">User </span>
                        <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                            Reviews
                        </span>
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                        See what our users are saying about their experience
                    </p>
                </motion.div>
            </div>

            {/* Scrolling Container - Full Width - RIGHT TO LEFT */}
            <div className="relative w-full overflow-hidden">

                {/* Scrolling Track - Right to left animation */}
                <motion.div
                    className="inline-flex gap-4 sm:gap-6 py-2 whitespace-nowrap will-change-transform"
                    animate={{
                        x: ["0%", "-50%"]
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: Math.max(25, reviews.length * 3),
                            ease: "linear",
                        },
                    }}
                >
                    {/* Triple duplicate for seamless loop with no gaps */}
                    {[...reviews, ...reviews, ...reviews].map((review, index) => (
                        <div
                            key={`${review.id}-${index}`}
                            className="flex-shrink-0 w-[320px] sm:w-[380px] group inline-block"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                <div className="bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-2xl overflow-hidden h-full shadow-xl hover:shadow-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-[#FF6B35]/50 dark:hover:border-[#FF6B35]/50 transition-all p-5">
                                    
                                    {/* User Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <img
                                            src={review.user.avatar || `${defaultAvatar}${review.user.name}`}
                                            alt={review.user.name}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                {review.user.name}
                                            </h3>
                                            
                                            {/* Rating Stars */}
                                            <div className="flex items-center gap-1 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${
                                                            i < review.rating
                                                                ? 'text-yellow-500 fill-yellow-500'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Date Badge */}
                                        {review.dateFormatted && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-[10px]">
                                                    {new Date(review.date).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        year: 'numeric' 
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Review Comment */}
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 leading-relaxed mb-4">
                                        {review.comment}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                        {/* Thumbs Up */}
                                        {review.thumbsUp > 0 && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <ThumbsUp className="w-3.5 h-3.5 text-[#FF6B35]" />
                                                <span className="font-medium">{review.thumbsUp} helpful</span>
                                            </div>
                                        )}
                                        
                                        {/* Version Badge */}
                                        {review.version && (
                                            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-medium text-gray-600 dark:text-gray-400">
                                                v{review.version}
                                            </div>
                                        )}
                                    </div>

                                    {/* Developer Reply */}
                                    {review.replyText && (
                                        <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">GT</span>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                                    Developer Response
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {review.replyText}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}