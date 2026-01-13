"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquareQuote, Quote, Loader2, ArrowLeft } from "lucide-react";
import { avatar } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/landing/profile/reviews");
      const data = await res.json();
      if (data.success) setReviews(data.data.reviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 px-4 sm:px-0 pb-6">
       
       {/* Header */}
       <div className="flex items-center gap-3 mb-2">
        <Link 
          href="/profile" 
          className="lg:hidden p-2 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">My Reviews</h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Feedback you've given.</p>
        </div>
      </div>

      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#FF6B35] mb-2" />
            <p className="text-xs text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <MessageSquareQuote className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Reviews Yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
              You haven't shared your experience with any astrologers yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 shadow-sm"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-full border border-gray-100 dark:border-white/10 flex-shrink-0 overflow-hidden">
                      <Image
                        src={avatar(review.astrologer?.profileImage)}
                        alt={review.astrologer?.name}
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                {review.astrologer?.name}
                            </h3>
                            <p className="text-[10px] text-gray-400">
                                {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded-md">
                            <span className="text-xs font-bold text-[#FF6B35]">{review.rating}</span>
                            <Star className="h-3 w-3 text-[#FF6B35] fill-current" />
                        </div>
                    </div>

                    <div className="relative mt-2">
                        <Quote className="absolute -top-1 -left-2 h-4 w-4 text-gray-200 dark:text-white/10 -z-10 opacity-50" />
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            "{review.review}"
                        </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}