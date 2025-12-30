///Users/xeoren/Desktop/gyanitallk-admin/src/app/landing/astro/[slug]/AstrologerDetailClient.tsx
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
  const [activeTab, setActiveTab] = useState<
    "about" | "reviews" | "availability"
  >("about");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const displayReviews = useMemo(
    () =>
      showAllReviews ? astrologer.reviews : astrologer.reviews.slice(0, 5),
    [astrologer.reviews, showAllReviews],
  );

function redirectToAppStore() {
  if (typeof window === "undefined") return;

  const ua = navigator.userAgent || "";

  const isAndroid = /android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua);

  // 📱 Android → Play Store
  if (isAndroid) {
    window.location.href =
      "https://play.google.com/store/apps/details?id=com.app.gyanitalk";
    return;
  }

  // 📱 iOS → App Store
  if (isIOS) {
    window.location.href =
      "https://apps.apple.com/in/app/gyanitalk/id6742021396";
    return;
  }

  // 🖥 Desktop → open Play Store in new tab
  window.open(
    "https://play.google.com/store/apps/details?id=com.app.gyanitalk",
    "_blank",
    "noopener,noreferrer"
  );
}

  return (
    <LandingWrapper>
      {/* Breadcrumb */}
      <section className="px-4 pb-4 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full">
          <motion.nav
            className="flex items-center gap-2 overflow-x-auto text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/talk-to-astrologers"
              className="flex-shrink-0 text-gray-500 transition-colors hover:text-[#FF6B35]"
            >
              Astrologers
            </Link>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className="truncate font-medium text-gray-900 dark:text-white">
              {astrologer.name}
            </span>
          </motion.nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full">
          <motion.div
            className="rounded-2xl border border-gray-200/60 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-white/5 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {(astrologer.top_badge || astrologer.featured_badge) && (
                  <div className="absolute -right-1 -top-1 z-10 flex flex-col gap-1">
                    {astrologer.top_badge && (
                      <div className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md">
                        <Award className="h-2 w-2" />
                        <span>TOP</span>
                      </div>
                    )}
                    {astrologer.featured_badge && (
                      <div className="rounded-full bg-purple-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md">
                        FEATURED
                      </div>
                    )}
                  </div>
                )}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B35] to-[#FFB347] opacity-40 blur-md" />
                  <img
                    src={avatar(astrologer.profileImage)}
                    alt={astrologer.name}
                    className="relative h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-gray-900 sm:h-28 sm:w-28"
                    loading="eager"
                    width={112}
                    height={112}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                    {astrologer.name}
                  </h1>
                  {astrologer.isVerified && (
                    <span
                      className="verified-badge flex-shrink-0"
                      title="Verified Astrologer"
                      aria-label="Verified"
                    />
                  )}
                  <Sparkles
                    className="h-4 w-4 text-[#FF6B35]"
                    aria-hidden="true"
                  />
                </div>

                {/* Quick Stats */}
                <div className="mb-3 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 dark:text-gray-400 sm:justify-start sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Star
                      className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {astrologer.avgRating
                        ? astrologer.avgRating.toFixed(1)
                        : "New"}
                    </span>
                    <span className="text-gray-500">
                      ({astrologer.reviewsCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{astrologer.experienceInYears}y experience</span>
                  </div>
                  {astrologer.languageKnown && (
                    <div className="flex items-center gap-1">
                      <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="max-w-[160px] truncate">
                        {astrologer.languageKnown
                          .split(",")
                          .slice(0, 2)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  {astrologer.currentCity && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{astrologer.currentCity}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {astrologer.allSkill && (
                  <div className="mb-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                    {astrologer.allSkill
                      .split(",")
                      .slice(0, 5)
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-[#FF6B35]/8 rounded-full px-2 py-0.5 text-[11px] font-medium text-[#FF6B35]"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                )}

                {/* CTA */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200/70 bg-gray-50/80 px-3 py-2 dark:border-gray-700/70 dark:bg-gray-800/60">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Starts at
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{astrologer.charge}
                      <span className="text-xs font-normal text-gray-500">
                        /min
                      </span>
                    </span>
                  </div>
                  <motion.button
                    onClick={redirectToAppStore}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-5 py-2.5 text-sm font-semibold text-white shadow-lg sm:flex-initial"
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
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full">
          {/* Tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist">
            {(["about", "reviews", "availability"] as const).map((tab) => {
              if (tab === "reviews" && astrologer.reviews.length === 0)
                return null;
              if (
                tab === "availability" &&
                astrologer.availabilities.length === 0
              )
                return null;

              const isActive = activeTab === tab;

              return (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md"
                      : "border border-gray-200/70 bg-white/70 text-gray-700 dark:border-gray-700/70 dark:bg-white/5 dark:text-gray-300"
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
                  className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                    <BookOpen
                      className="h-4 w-4 text-[#FF6B35]"
                      aria-hidden="true"
                    />
                    About
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {astrologer.loginBio}
                  </p>
                </motion.div>
              )}

              {/* Service Rates */}
              <motion.div
                className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                viewport={{ once: true }}
              >
                <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white">
                  Service Rates
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/60">
                    <div className="mb-2 flex items-center gap-1.5">
                      <MessageSquare
                        className="h-3.5 w-3.5 text-[#FF6B35]"
                        aria-hidden="true"
                      />
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        Chat
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{astrologer.charge}
                      <span className="text-[10px] font-normal text-gray-500">
                        /min
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/60">
                    <div className="mb-2 flex items-center gap-1.5">
                      <Phone
                        className="h-3.5 w-3.5 text-[#FF6B35]"
                        aria-hidden="true"
                      />
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        Call
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{astrologer.charge}
                      <span className="text-[10px] font-normal text-gray-500">
                        /min
                      </span>
                    </p>
                  </div>

                  {astrologer.videoCallRate && (
                    <div className="rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/60">
                      <div className="mb-2 flex items-center gap-1.5">
                        <Video
                          className="h-3.5 w-3.5 text-[#FF6B35]"
                          aria-hidden="true"
                        />
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          Video
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{astrologer.videoCallRate}
                        <span className="text-[10px] font-normal text-gray-500">
                          /min
                        </span>
                      </p>
                    </div>
                  )}

                  {astrologer.reportRate && (
                    <div className="rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/60">
                      <div className="mb-2 flex items-center gap-1.5">
                        <BookOpen
                          className="h-3.5 w-3.5 text-[#FF6B35]"
                          aria-hidden="true"
                        />
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
                  className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                    <GraduationCap
                      className="h-4 w-4 text-[#FF6B35]"
                      aria-hidden="true"
                    />
                    Education
                  </h3>
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    {astrologer.highestQualification && (
                      <div>
                        <p className="mb-0.5 text-xs text-gray-500">
                          Qualification
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {astrologer.highestQualification}
                        </p>
                      </div>
                    )}
                    {astrologer.degree && (
                      <div>
                        <p className="mb-0.5 text-xs text-gray-500">Degree</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {astrologer.degree}
                        </p>
                      </div>
                    )}
                    {astrologer.college && (
                      <div>
                        <p className="mb-0.5 text-xs text-gray-500">
                          Institution
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {astrologer.college}
                        </p>
                      </div>
                    )}
                    {astrologer.learnAstrology && (
                      <div>
                        <p className="mb-0.5 text-xs text-gray-500">Training</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {astrologer.learnAstrology}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Stats */}
              <motion.div
                className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                viewport={{ once: true }}
              >
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                  <Users
                    className="h-4 w-4 text-[#FF6B35]"
                    aria-hidden="true"
                  />
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    {
                      value: astrologer.stats.followerCount,
                      label: "Followers",
                    },
                    { value: astrologer.stats.reviewCount, label: "Reviews" },
                    {
                      value: astrologer.stats.chatRequestCount,
                      label: "Chats",
                    },
                    {
                      value: astrologer.stats.callRequestCount,
                      label: "Calls",
                    },
                    { value: astrologer.stats.orderCount, label: "Orders" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-gray-50/80 p-3 text-center dark:bg-gray-800/60"
                    >
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* What I Do / Why I'm Here */}
              {(astrologer.whatwillDo || astrologer.whyOnBoard) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {astrologer.whatwillDo && (
                    <motion.div
                      className="rounded-2xl border border-gray-200/70 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <h4 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
                        What I Do
                      </h4>
                      <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                        {astrologer.whatwillDo}
                      </p>
                    </motion.div>
                  )}
                  {astrologer.whyOnBoard && (
                    <motion.div
                      className="rounded-2xl border border-gray-200/70 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <h4 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
                        Why I'm Here
                      </h4>
                      <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
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
              className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              role="tabpanel"
              id="reviews-panel"
            >
              <h2 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">
                Customer Reviews ({astrologer.reviewsCount})
              </h2>
              <div className="space-y-4">
                {displayReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    className="border-b border-gray-200/60 pb-4 last:border-0 last:pb-0 dark:border-gray-700/60"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex gap-3">
                      <img
                        src={avatar(review.user?.profile)}
                        alt={review.user?.name || "User"}
                        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        loading="lazy"
                        width={40}
                        height={40}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {review.user?.name || "Anonymous User"}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Star
                              className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                              aria-hidden="true"
                            />
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <p className="mb-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {review.review}
                        </p>
                        {review.reply && (
                          <div className="mt-2 rounded-r-lg border-l-2 border-[#FF6B35] bg-gray-50/80 p-2.5 pl-3 dark:bg-gray-800/60">
                            <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold text-[#FF6B35]">
                                Reply:
                              </span>
                            </p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              {review.reply}
                            </p>
                          </div>
                        )}
                        <p className="mt-1.5 text-[10px] text-gray-500">
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
                  className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-[#FF6B35] transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
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
          {activeTab === "availability" &&
            astrologer.availabilities.length > 0 && (
              <motion.div
                className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                role="tabpanel"
                id="availability-panel"
              >
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Weekly Schedule
                </h2>
                <div className="space-y-2">
                  {astrologer.availabilities.map((avail, index) => (
                    <motion.div
                      key={avail.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50/80 p-3 text-sm dark:bg-gray-800/60"
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
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full text-center">
          <Link
            href="/talk-to-astrologers"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200/70 bg-white/70 px-6 py-3 font-medium text-gray-900 backdrop-blur-xl transition-all hover:scale-105 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/5 dark:text-white dark:hover:bg-gray-800/60"
          >
            <ArrowLeft className="h-4 w-4" />
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
