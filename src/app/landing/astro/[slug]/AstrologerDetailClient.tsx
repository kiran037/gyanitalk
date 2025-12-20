"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  Star,
  Clock,
  Languages,
  MapPin,
  Award,
  Calendar,
  GraduationCap,
  Users,
  MessageSquare,
  Phone,
  Video,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import { motion } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  review: string;
  reply: string | null;
  isPublic: boolean | null;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    profile: string | null;
  } | null;
}

interface Availability {
  id: string;
  day: string;
  fromTime: string | null;
  toTime: string | null;
}

interface Assistant {
  id: string;
  name: string;
  email: string | null;
  contactNo: string;
  gender: string;
  primarySkill: string | null;
  allSkill: string | null;
  languageKnown: string | null;
  experienceInYears: number;
  profile: string | null;
}

interface Astrologer {
  id: string;
  userId: string;
  name: string;
  email: string;
  contactNo: string;
  gender: string;
  birthDate: string;
  primarySkill: string | null;
  allSkill: string | null;
  languageKnown: string | null;
  profileImage: string | null;
  charge: number;
  experienceInYears: number;
  dailyContribution: number;
  currentCity: string | null;
  highestQualification: string | null;
  degree: string | null;
  college: string | null;
  learnAstrology: string | null;
  isVerified: boolean;
  isLiveOff: number;
  monthlyEarning: string | null;
  whatwillDo: string | null;
  whyOnBoard: string | null;
  top_badge: string | null;
  featured_badge: string | null;
  chatStatus: string | null;
  chatWaitTime: string | null;
  callStatus: string | null;
  callWaitTime: string | null;
  videoCallRate: number | null;
  reportRate: number | null;
  socialLinks: {
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
    youtube: string | null;
    website: string | null;
  };
  loginBio: string | null;
  created_at: string;
  updated_at: string;
  assistants: Assistant[];
  availabilities: Availability[];
  reviews: Review[];
  avgRating: number | null;
  reviewsCount: number;
  stats: {
    followerCount: number;
    reviewCount: number;
    chatRequestCount: number;
    callRequestCount: number;
    orderCount: number;
  };
}

interface Props {
  astrologer: Astrologer;
}

export default function AstrologerDetailClient({ astrologer }: Props) {
  const router = useRouter();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "availability">(
    "about"
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const displayReviews = useMemo(
    () => (showAllReviews ? astrologer.reviews : astrologer.reviews.slice(0, 5)),
    [astrologer.reviews, showAllReviews]
  );

  return (
    <LandingWrapper>
      {/* Breadcrumb */}
      <section className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="w-full mx-auto">
          <motion.nav
            className="flex items-center gap-2 text-sm overflow-x-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/landing/astro"
              className="text-gray-500 hover:text-[#FF6B35] transition-colors flex-shrink-0"
            >
              Astrologers
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 dark:text-white font-medium truncate">
              {astrologer.name}
            </span>
          </motion.nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="pb-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full mx-auto">
          <motion.div
            className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start text-center sm:text-left">
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                {(astrologer.top_badge || astrologer.featured_badge) && (
                  <div className="absolute -top-1 -right-1 flex flex-col gap-1 z-10">
                    {astrologer.top_badge && (
                      <div className="px-1.5 py-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-[9px] font-bold rounded-full flex items-center gap-0.5 shadow-md">
                        <Award className="w-2 h-2" />
                        <span>TOP</span>
                      </div>
                    )}
                    {astrologer.featured_badge && (
                      <div className="px-1.5 py-0.5 bg-purple-600 text-white text-[9px] font-bold rounded-full shadow-md">
                        FEATURED
                      </div>
                    )}
                  </div>
                )}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B35] to-[#FFB347] blur-md opacity-40" />
                  <img
                    src={avatar(astrologer.profileImage)}
                    alt={astrologer.name}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white dark:ring-gray-900 shadow-lg"
                    loading="eager"
                    width={112}
                    height={112}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {astrologer.name}
                  </h1>
                  {astrologer.isVerified && (
                    <span
                      className="verified-badge flex-shrink-0"
                      title="Verified Astrologer"
                      aria-label="Verified"
                    />
                  )}
                  <Sparkles className="w-4 h-4 text-[#FF6B35]" aria-hidden="true" />
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {astrologer.avgRating ? astrologer.avgRating.toFixed(1) : "New"}
                    </span>
                    <span className="text-gray-500">({astrologer.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{astrologer.experienceInYears}y experience</span>
                  </div>
                  {astrologer.languageKnown && (
                    <div className="flex items-center gap-1">
                      <Languages className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="truncate max-w-[160px]">
                        {astrologer.languageKnown.split(",").slice(0, 2).join(", ")}
                      </span>
                    </div>
                  )}
                  {astrologer.currentCity && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{astrologer.currentCity}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {astrologer.allSkill && (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mb-4">
                    {astrologer.allSkill
                      .split(",")
                      .slice(0, 5)
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#FF6B35]/8 text-[#FF6B35] text-[11px] font-medium rounded-full"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                )}

                {/* CTA */}
                <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl border border-gray-200/70 dark:border-gray-700/70">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Starts at
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{astrologer.charge}
                      <span className="text-xs font-normal text-gray-500">/min</span>
                    </span>
                  </div>
                  <motion.button
                    onClick={() => router.push("/")}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white font-semibold rounded-xl shadow-lg text-sm"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    aria-label="Get app to consult with astrologer"
                  >
                    Get App to Consult
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs & Content */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1" role="tablist">
            {(["about", "reviews", "availability"] as const).map((tab) => {
              if (tab === "reviews" && astrologer.reviews.length === 0) return null;
              if (tab === "availability" && astrologer.availabilities.length === 0)
                return null;

              const isActive = activeTab === tab;

              return (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-2xl font-medium text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md"
                      : "bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/70 text-gray-700 dark:text-gray-300"
                  }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab}-panel`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "reviews" && ` (${astrologer.reviewsCount})`}
                </motion.button>
              );
            })}
          </div>

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <div className="space-y-4" role="tabpanel" id="about-panel">
              {/* Bio */}
              {astrologer.loginBio && (
                <motion.div
                  className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800 rounded-2xl p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#FF6B35]" aria-hidden="true" />
                    About
                  </h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {astrologer.loginBio}
                  </p>
                </motion.div>
              )}

              {/* Service Rates */}
              <motion.div
                className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800 rounded-2xl p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                viewport={{ once: true }}
              >
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                  Service Rates
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-[#FF6B35]" aria-hidden="true" />
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        Chat
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{astrologer.charge}
                      <span className="text-[10px] font-normal text-gray-500">/min</span>
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Phone className="w-3.5 h-3.5 text-[#FF6B35]" aria-hidden="true" />
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        Call
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{astrologer.charge}
                      <span className="text-[10px] font-normal text-gray-500">/min</span>
                    </p>
                  </div>

                  {astrologer.videoCallRate && (
                    <div className="p-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Video className="w-3.5 h-3.5 text-[#FF6B35]" aria-hidden="true" />
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          Video
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{astrologer.videoCallRate}
                        <span className="text-[10px] font-normal text-gray-500">/min</span>
                      </p>
                    </div>
                  )}

                  {astrologer.reportRate && (
                    <div className="p-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-2">
                        <BookOpen className="w-3.5 h-3.5 text-[#FF6B35]" aria-hidden="true" />
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          Report
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{astrologer.reportRate}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Education */}
              {(astrologer.highestQualification ||
                astrologer.degree ||
                astrologer.college ||
                astrologer.learnAstrology) && (
                <motion.div
                  className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800 rounded-2xl p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#FF6B35]" aria-hidden="true" />
                    Education
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {astrologer.highestQualification && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Qualification</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {astrologer.highestQualification}
                        </p>
                      </div>
                    )}
                    {astrologer.degree && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Degree</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {astrologer.degree}
                        </p>
                      </div>
                    )}
                    {astrologer.college && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Institution</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {astrologer.college}
                        </p>
                      </div>
                    )}
                    {astrologer.learnAstrology && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Training</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {astrologer.learnAstrology}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Stats */}
              <motion.div
                className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800 rounded-2xl p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                viewport={{ once: true }}
              >
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF6B35]" aria-hidden="true" />
                  Statistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { value: astrologer.stats.followerCount, label: "Followers" },
                    { value: astrologer.stats.reviewCount, label: "Reviews" },
                    { value: astrologer.stats.chatRequestCount, label: "Chats" },
                    { value: astrologer.stats.callRequestCount, label: "Calls" },
                    { value: astrologer.stats.orderCount, label: "Orders" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="text-center p-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl"
                    >
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* What I Do / Why I'm Here */}
              {(astrologer.whatwillDo || astrologer.whyOnBoard) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {astrologer.whatwillDo && (
                    <motion.div
                      className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800 rounded-2xl p-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                        What I Do
                      </h4>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {astrologer.whatwillDo}
                      </p>
                    </motion.div>
                  )}
                  {astrologer.whyOnBoard && (
                    <motion.div
                      className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800 rounded-2xl p-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                        Why I'm Here
                      </h4>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {astrologer.whyOnBoard}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && astrologer.reviews.length > 0 && (
            <motion.div
              className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800 rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              role="tabpanel"
              id="reviews-panel"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
                Customer Reviews ({astrologer.reviewsCount})
              </h2>
              <div className="space-y-4">
                {displayReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    className="pb-4 border-b border-gray-200/60 dark:border-gray-700/60 last:border-0 last:pb-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex gap-3">
                      <img
                        src={avatar(review.user?.profile)}
                        alt={review.user?.name || "User"}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        loading="lazy"
                        width={40}
                        height={40}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                            {review.user?.name || "Anonymous User"}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                            <span className="font-semibold text-xs text-gray-900 dark:text-white">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                          {review.review}
                        </p>
                        {review.reply && (
                          <div className="mt-2 pl-3 border-l-2 border-[#FF6B35] bg-gray-50/80 dark:bg-gray-800/60 p-2.5 rounded-r-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span className="font-semibold text-[#FF6B35]">Reply:</span>
                            </p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              {review.reply}
                            </p>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-500 mt-1.5">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {astrologer.reviews.length > 5 && (
                <motion.button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-4 w-full py-2.5 text-sm text-[#FF6B35] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-expanded={showAllReviews}
                >
                  {showAllReviews
                    ? "Show Less"
                    : `View All ${astrologer.reviews.length} Reviews`}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* AVAILABILITY TAB */}
          {activeTab === "availability" && astrologer.availabilities.length > 0 && (
            <motion.div
              className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800 rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              role="tabpanel"
              id="availability-panel"
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                Weekly Schedule
              </h2>
              <div className="space-y-2">
                {astrologer.availabilities.map((avail, index) => (
                  <motion.div
                    key={avail.id}
                    className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-lg text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {avail.day}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {avail.fromTime && avail.toTime
                        ? `${avail.fromTime} - ${avail.toTime}`
                        : "Not Available"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Back Button */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full mx-auto text-center">
          <Link
            href="/landing/astro"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/70 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-gray-800/60 backdrop-blur-xl border border-gray-200/70 dark:border-gray-800 rounded-xl font-medium text-gray-900 dark:text-white transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Astrologers
          </Link>
        </div>
      </section>

      {/* Verified Badge Styles */}
      <style jsx global>{`
        .verified-badge {
          position: relative;
          display: inline-block;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .verified-badge:before,
        .verified-badge:after {
          content: "✓";
          color: white;
          font-size: 11px;
          font-weight: bold;
          text-align: center;
          vertical-align: middle;
          position: absolute;
          top: 0;
          left: 0;
          display: inline-block;
          width: 18px;
          height: 18px;
          line-height: 18px;
          background: #ff6b35;
          border-radius: 20%;
        }
        .verified-badge:before {
          transform: rotate(45deg);
        }
      `}</style>
    </LandingWrapper>
  );
}