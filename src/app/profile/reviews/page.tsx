"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
      // Note: We don't need to fetch 'profile' just to show reviews, 
      // unless you need the user's name in the header.
      const res = await fetch("/api/landing/profile/reviews");
      const data = await res.json();
      if (data.success) setReviews(data.data.reviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35] mb-2" />
        <p className="text-sm text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
       
       {/* Header with Mobile Back Button */}
       <div className="flex items-start gap-4">
        <Link 
          href="/profile" 
          className="lg:hidden mt-1 p-2.5 rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Reviews</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Feedback you've given to astrologers.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden min-h-[400px]"
      >
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <MessageSquareQuote className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              You haven't shared your experience with any astrologers yet. Your feedback helps others!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 md:p-8 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Astrologer Info */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-gray-100 dark:border-white/10">
                      <Image
                        src={avatar(review.astrologer?.profileImage)}
                        alt={review.astrologer?.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{review.astrologer?.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 relative pl-0 md:pl-6 md:border-l border-gray-100 dark:border-white/10">
                    <Quote className="absolute top-0 left-6 h-8 w-8 text-gray-200 dark:text-white/5 -z-10 hidden md:block" />
                    
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-200 dark:text-gray-700"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {review.rating}.0
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                      "{review.review}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}