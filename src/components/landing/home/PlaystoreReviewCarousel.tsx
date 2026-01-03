"use client";

import { Star, ThumbsUp, Quote, Sparkles } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

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

const defaultAvatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

export default function PlaystoreReviewCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);

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

  // Duplicate for seamless loop (Triple buffer for wider screens)
  const trackReviews = useMemo(
    () => (reviews.length ? [...reviews, ...reviews, ...reviews] : []),
    [reviews]
  );

  if (loading) return <LoadingSkeleton />;
  if (!reviews.length) return null;

  return (
    <section className="relative py-12 sm:py-24 bg-[#FFFBF5] dark:bg-black overflow-hidden border-t border-gray-100 dark:border-gray-800">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/50 via-transparent to-transparent dark:from-orange-900/10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section (Compact) */}
        <motion.div 
          className="text-center mb-8 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm mb-4">
            <img src="/google-play-icon.svg" alt="Play Store" className="w-3 h-3" onError={(e) => e.currentTarget.style.display='none'} /> 
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                Google Play Verified
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 sm:mb-4 text-gray-900 dark:text-white">
            User <span className="text-[#FF6B35]">Love Stories</span>
          </h2>
          
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
            <span className="font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</span>
            <div className="flex text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
            </div>
            <span>•</span>
            <span>{total >= 1000 ? `${(total/1000).toFixed(1)}k+` : total} Ratings</span>
          </div>
        </motion.div>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative w-full overflow-hidden group">
        {/* Fade Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 z-20 bg-gradient-to-r from-[#FFFBF5] to-transparent dark:from-black pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 z-20 bg-gradient-to-l from-[#FFFBF5] to-transparent dark:from-black pointer-events-none" />

        {/* Marquee Track */}
        <div className="flex gap-4 sm:gap-6 animate-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused]">
          {trackReviews.map((review, index) => (
             <ReviewCard key={`${review.id}-${index}`} review={review} />
          ))}
        </div>
      </div>

      {/* Styles for animation */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        .animate-marquee {
          width: max-content;
          animation: marquee 200s linear infinite;
        }
        @media (max-width: 640px) {
           .animate-marquee { animation-duration: 60s; }
        }
      `}</style>
    </section>
  );
}

// --- Review Card Component (Compact) ---
function ReviewCard({ review }: { review: Review }) {
  return (
    // Reduced width to 260px on mobile
    <article className="w-[260px] sm:w-[320px] flex-shrink-0 select-none">
      <div className="h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-900/30 transition-all duration-300 flex flex-col relative">
        
        {/* Subtle Quote Icon */}
        <Quote className="absolute top-4 right-4 w-6 h-6 text-gray-100 dark:text-gray-800 fill-current" />

        {/* User Header */}
        <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-shrink-0">
                <img
                    src={review.user.avatar || defaultAvatar}
                    alt={review.user.name}
                    loading="lazy"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-gray-50 dark:ring-gray-800 bg-gray-100"
                    onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-[2px] border-2 border-white dark:border-gray-900">
                    <Sparkles className="w-1.5 h-1.5 text-white fill-white" />
                </div>
            </div>
            
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                    {review.user.name}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-2.5 h-2.5 ${i < review.rating ? "fill-current" : "text-gray-200 dark:text-gray-700"}`} 
                            />
                        ))}
                    </div>
                    <span className="truncate opacity-80">
                        {review.dateFormatted || "Recent"}
                    </span>
                </div>
            </div>
        </div>

        {/* Comment Body - Line Clamped */}
        <div className="flex-1 mb-3">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                {review.comment}
            </p>
        </div>

        {/* Footer Meta (Compact) */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800 mt-auto">
            {/* Conditional Version Tag - Only show if enough space */}
            <div className="flex items-center gap-2">
                {review.version && (
                    <span className="text-[9px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        v{review.version}
                    </span>
                )}
            </div>
            
            {review.thumbsUp > 0 && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                    <ThumbsUp className="w-3 h-3 text-[#FF6B35]" />
                    <span>{review.thumbsUp}</span>
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
    <section className="py-16 bg-[#FFFBF5] dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 text-center mb-8">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-2 animate-pulse" />
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden px-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[260px] h-[160px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex-shrink-0 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800" />
                        <div className="space-y-1.5">
                            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-2 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                </div>
            ))}
        </div>
    </section>
  );
}