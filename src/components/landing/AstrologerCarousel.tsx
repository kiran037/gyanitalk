"use client";

import { Star, Clock, Languages, Award, ArrowRight } from "lucide-react";
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
    return () => {
      cancelled = true;
    };
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

  if (astrologers.length === 0) return null;

  // control how fast the belt moves (bigger = slower)
  const duration = Math.max(18, astrologers.length * 2.2);

  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02] overflow-x-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-block mb-4 sm:mb-6">
            <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#FF6B35]">
              MEET OUR EXPERTS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="text-gray-900 dark:text-white">Talk to </span>
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
              Top Astrologers
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            Connect with verified experts for personalized guidance on love, career, health & more
          </p>
        </motion.div>
      </div>

      {/* Auto-scrolling belt */}
      <div className="relative w-full overflow-hidden">
        <motion.div
          className="inline-flex gap-3 sm:gap-4 py-2 whitespace-nowrap will-change-transform"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            duration,
          }}
        >
          {[...astrologers, ...astrologers].map((astro, index) => (
            <div
              key={`${astro.id}-${index}`}
              className="flex-shrink-0 w-[240px] sm:w-[260px] group transform transition-transform duration-150 hover:scale-[1.02]"
            >
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-3 sm:p-4 h-full shadow-lg hover:shadow-xl hover:border-[#FF6B35]/50 transition-all">
                {/* Header */}
                <div className="flex gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
                  {/* Avatar with Badge */}
                  <div className="flex-shrink-0 relative">
                    {astro.badges?.top_badge && (
                      <div className="absolute -top-0.5 -right-0.5 px-1 py-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-[8px] font-bold rounded-full flex items-center gap-0.5 z-10 shadow-md">
                        <Award className="w-1.5 h-1.5" />
                        <span>TOP</span>
                      </div>
                    )}
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                      <img
                        src={avatar(astro.profileImage)}
                        alt={astro.name}
                        className="w-full h-full rounded-full object-cover ring-2 ring-gray-200/60 dark:ring-gray-700/60 group-hover:ring-[#FF6B35]/50 transition-all"
                      />
                      {(astro.chatStatus === "online" || astro.callStatus === "online") && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                      <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-[#FF6B35] transition-colors">
                        {astro.name}
                      </h1>
                      {astro.isVerified && (
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <rect
                            width="16"
                            height="16"
                            rx="3"
                            fill="#FF6B35"
                            transform="rotate(45 8 8)"
                          />
                          <path
                            d="M6 8L7.5 9.5L10 7"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {astro.avgRating != null && (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5 bg-green-500/10 px-1.5 py-0.5 rounded">
                          <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-green-600 fill-green-600" />
                          <span className="text-[10px] sm:text-xs font-semibold text-green-600">
                            {astro.avgRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">
                          ({astro.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {astro.allSkill && (
                  <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                    {astro.allSkill
                      .split(",")
                      .slice(0, 3)
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] text-[9px] sm:text-[10px] font-medium rounded"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {astro.experienceInYears != null && (
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FF6B35]" />
                      <span>{astro.experienceInYears}+ years</span>
                    </div>
                  )}

                  {astro.languageKnown && (
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Languages className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FF6B35]" />
                      <span className="truncate max-w-[100px]">
                        {astro.languageKnown.split(",").slice(0, 2).join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {astro.loginBio && (
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {astro.loginBio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        className="relative z-20 text-center mt-8 sm:mt-12 px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Link href="/landing/astro">
          <motion.button
            className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl shadow-lg text-sm sm:text-base font-semibold"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            See All Astrologers
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}