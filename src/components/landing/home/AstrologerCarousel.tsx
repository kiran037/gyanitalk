"use client";

import { 
  Star, Clock, Languages, Award, ArrowRight, 
  Sparkles, BadgeCheck, IndianRupee, MessageCircle, Phone 
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { avatar } from "@/lib/images";

interface Astrologer {
  id: string;
  name: string;
  slug: string;
  profileImage: string | null;
  primarySkill: string | null;
  allSkill: string | null;
  charge: number | null;
  experienceInYears: number | null;
  languageKnown: string | null;
  isVerified: boolean;
  chatStatus: string | null;
  callStatus: string | null;
  reviewCount: number;
  avgRating: number | null;
  loginBio: string | null;
  badges: {
    top_badge: string | null;
  };
}

export default function AstrologerCarousel() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAstros = async () => {
      try {
        const res = await fetch("/api/landing/astro/featured");
        const json = await res.json();
        if (!cancelled) {
          setAstrologers(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch astrologers:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAstros();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (astrologers.length === 0) return null;

  // Duplicate list multiple times to ensure smooth infinite loop
  // We need enough items to fill the screen width + buffer for the animation to look seamless
  const carouselItems = [...astrologers, ...astrologers, ...astrologers];

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black/40 overflow-hidden">
      
      {/* --- Cosmic Background Elements --- */}
      <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,53,0.05),transparent_70%)]" />
        <svg className="absolute w-full h-full text-orange-200 dark:text-gray-800" xmlns="http://www.w3.org/2000/svg">
          <pattern id="stars" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
            <circle cx="50" cy="50" r="1.5" fill="currentColor" opacity="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#stars)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-3 h-3" />
            Vedic Experts
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-gray-900 dark:text-white">Connect with </span>
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
              Top Astrologers
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Instant guidance on Love, Career, and Destiny from India's most trusted spiritual guides.
          </p>
        </motion.div>
      </div>

      {/* --- Carousel Belt --- */}
      <div className="relative w-full overflow-hidden py-4 group">
        {/* Gradients to fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 z-20 bg-gradient-to-r from-gray-50 to-transparent dark:from-black/40 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 z-20 bg-gradient-to-l from-gray-50 to-transparent dark:from-black/40 pointer-events-none" />

        {/* 
            Marquee Animation Container 
            - `animate-marquee`: Custom CSS animation defined in global styles or Tailwind config
            - `hover:pause`: Pauses on mouse hover
            - `active:pause` / Touch events: Pauses when user touches/drags
        */}
        <div className="flex gap-4 sm:gap-6 animate-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused]">
          {carouselItems.map((astro, index) => (
            <AstrologerCard key={`${astro.id}-${index}`} astro={astro} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-10">
        <Link href="/talk-to-astrologers">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
          >
            View All Astrologers
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </Link>
      </div>

      {/* Styles for Marquee Animation */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* Adjust -50% based on duplication logic */
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 60s linear infinite;
        }
        /* Mobile: Faster or Slower animation depending on preference */
        @media (max-width: 640px) {
           .animate-marquee {
             animation-duration: 40s;
           }
        }
      `}</style>
    </section>
  );
}

// --- Component: Individual Card ---
function AstrologerCard({ astro }: { astro: Astrologer }) {
  const isOnline = astro.chatStatus === "online" || astro.callStatus === "online";
  
  return (
    // Responsive Width: w-[260px] on mobile, w-[320px] on sm+
    <div className="relative w-[260px] sm:w-[320px] flex-shrink-0 select-none">
      <Link href={`/talk-to-astrologers/${astro.slug}`} className="block h-full">
        <div className="group h-full bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300">
          
          {/* Top Section: Avatar & Badges */}
          <div className="flex justify-between items-start mb-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-br from-orange-300 to-yellow-400">
                <img
                  src={avatar(astro.profileImage)}
                  alt={astro.name}
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-900"
                  loading="lazy"
                />
              </div>
              {astro.badges?.top_badge && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap">
                  <Award className="w-2.5 h-2.5 text-yellow-400" />
                  <span>TOP</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              {/* Rating */}
              <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg border border-green-100 dark:border-green-800">
                <Star className="w-3 h-3 text-green-600 fill-green-600" />
                <span className="text-xs font-bold text-green-700 dark:text-green-400">
                  {astro.avgRating?.toFixed(1) || "New"}
                </span>
                <span className="text-[10px] text-gray-400">({astro.reviewCount})</span>
              </div>
              
              {/* Online Status */}
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                  {astro.name}
                </h3>
                {astro.isVerified && (
                  <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 dark:fill-blue-900/30" />
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 py-3 border-y border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Exp</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {astro.experienceInYears}+ Years
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Rate</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    ₹{astro.charge}/min
                  </span>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="flex items-start gap-2 h-6 overflow-hidden">
              <Languages className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {astro.languageKnown?.split(",").slice(0, 2).map((lang, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded whitespace-nowrap">
                    {lang.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual Action Buttons */}
            <div className="flex gap-2 pt-2">
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs font-bold group-hover:bg-orange-100 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
                Chat
              </div>
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                Call
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// --- Loading State ---
function LoadingSkeleton() {
  return (
    <section className="relative py-24 bg-[#FFFBF5] dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4 animate-pulse" />
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto animate-pulse" />
      </div>
      <div className="flex gap-6 overflow-hidden px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-[260px] sm:w-[320px] h-[350px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 flex-shrink-0 animate-pulse">
            <div className="flex justify-between mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="w-12 h-6 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="space-y-3">
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}