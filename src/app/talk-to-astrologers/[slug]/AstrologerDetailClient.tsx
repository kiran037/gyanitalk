
"use client";
declare global {
  interface Window {
    dataLayer: any[];
  }
}

import { useState, useMemo, useEffect } from "react";
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
  MessageSquare,
  Phone,
  Video,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  BadgeCheck,
  Share2
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import { motion, AnimatePresence } from "framer-motion";

/* ================= TYPES ================= */
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

// Ensure this matches the Server Component interface to avoid TS errors
export interface Astrologer {
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
  // SEO is passed from server but not strictly needed in UI props unless used
  seo?: any; 
}

interface Props {
  astrologer: Astrologer;
}

export default function AstrologerDetailClient({ astrologer }: Props) {
  const router = useRouter();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "availability">("about");

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

  useEffect(() => {
    if (!astrologer) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "astrologer_schema",
      schema_type: "astrologer",
      name: astrologer.name,
      url: typeof window !== "undefined" ? window.location.href : "",
      image: avatar(astrologer.profileImage),
      experience: `${astrologer.experienceInYears}+ years`,
      expertise: astrologer.allSkill || astrologer.primarySkill || "",
      rating: astrologer.avgRating ? astrologer.avgRating.toFixed(1) : "New",
      review_count: astrologer.reviewsCount.toString(),
      chat_rate: astrologer.charge,
    });
  }, [astrologer]);

  function redirectToAppStore() {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent || "";
    const isAndroid = /android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    if (isAndroid) {
      window.location.href = "https://play.google.com/store/apps/details?id=com.app.gyanitalk";
      return;
    }
    if (isIOS) {
      window.location.href = "https://apps.apple.com/in/app/gyanitalk/id6742021396";
      return;
    }
    window.open(
      "https://play.google.com/store/apps/details?id=com.app.gyanitalk",
      "_blank",
      "noopener,noreferrer"
    );
  }

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <LandingWrapper>
      <main className="min-h-screen bg-gray-50/50 pb-12 dark:bg-gray-950">
        
        {/* === Breadcrumb === */}
        <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/talk-to-astrologers" className="hover:text-orange-500 hover:underline">
              Astrologers
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="truncate font-medium text-gray-900 dark:text-white">
              {astrologer.name}
            </span>
          </nav>
        </div>

        {/* === Hero Section === */}
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-xl shadow-orange-500/5 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900 dark:shadow-none sm:p-8"
          >
            {/* Background Decoration */}
            <div className="absolute right-0 top-0 -z-10 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-orange-100/50 blur-3xl dark:bg-orange-900/10" />

            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              
              {/* Avatar Column */}
              <div className="flex shrink-0 flex-col items-center md:items-start">
                <div className="relative">
                  {/* Badges */}
                  <div className="absolute -right-2 -top-2 z-10 flex flex-col gap-1">
                    {astrologer.top_badge || astrologer.featured_badge ? (
                      <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        <Award className="h-3 w-3" /> TOP
                      </span>
                    ) : null}
                    {astrologer.featured_badge && (
                      <span className="rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm text-center">
                        FEATURED
                      </span>
                    )}
                  </div>

                  {/* Profile Image */}
                  <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-white shadow-lg dark:ring-gray-800 sm:h-32 sm:w-32">
                    <img
                      src={avatar(astrologer.profileImage)}
                      alt={astrologer.name}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  </div>
                </div>

                {/* Mobile Stats Row (Visible only on small screens) */}
                <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-gray-600 dark:text-gray-400 md:hidden">
                  <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900 dark:text-white">
                      {astrologer.avgRating ? astrologer.avgRating.toFixed(1) : "New"}
                    </span>
                    <span>({astrologer.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
                    <Clock className="h-3 w-3" />
                    <span>{astrologer.experienceInYears}y Exp</span>
                  </div>
                </div>
              </div>

              {/* Info Column */}
              <div className="flex flex-1 flex-col text-center md:text-left">
                {/* Header */}
                <div className="mb-2">
                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                      {astrologer.name}
                    </h1>
                    {astrologer.isVerified && (
                      <BadgeCheck className="h-6 w-6 fill-orange-500 text-white" aria-label="Verified Astrologer" />
                    )}
                  </div>
                </div>

                {/* Desktop Stats (Hidden on mobile) */}
                <div className="mb-4 hidden flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 md:flex">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900 dark:text-white">
                      {astrologer.avgRating ? astrologer.avgRating.toFixed(1) : "New"}
                    </span>
                    <span>({astrologer.reviewsCount} Reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {astrologer.experienceInYears} Years Experience
                  </span>
                  {astrologer.currentCity && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {astrologer.currentCity}
                    </span>
                  )}
                </div>

                {/* Languages - Responsive */}
                {astrologer.languageKnown && (
                  <div className="mb-4 flex items-start justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 md:justify-start">
                    <Languages className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <p className="text-center md:text-left leading-tight">
                       {astrologer.languageKnown.replace(/,/g, ", ")}
                    </p>
                  </div>
                )}

                {/* Skills Chips */}
                {astrologer.allSkill && (
                  <div className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start">
                    {astrologer.allSkill.split(",").map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-100 dark:border-orange-900/30"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pricing & CTA */}
                <div className="mt-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-between md:justify-start md:gap-6">
                  <div className="flex items-baseline gap-1 rounded-xl bg-gray-50 px-4 py-2 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Rate:</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{astrologer.charge}
                    </span>
                    <span className="text-xs text-gray-500">/min</span>
                  </div>

                  <motion.button
                    onClick={redirectToAppStore}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/30 sm:w-auto"
                  >
                    Consult Now
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* === Content Tabs === */}
        <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2">
              
              {/* Tab Navigation */}
              <div className="scrollbar-hide sticky top-[70px] z-20 mb-6 -mx-4 overflow-x-auto bg-gray-50/95 px-4 py-2 backdrop-blur-sm dark:bg-gray-950/95 sm:mx-0 sm:rounded-2xl sm:px-0">
                <div className="flex gap-2 sm:gap-4">
                  {(["about", "reviews", "availability"] as const).map((tab) => {
                    if (tab === "reviews" && astrologer.reviews.length === 0) return null;
                    if (tab === "availability" && astrologer.availabilities.length === 0) return null;
                    
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? "text-white"
                            : "text-gray-600 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 rounded-full bg-gray-900 dark:bg-gray-700"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10 capitalize">
                          {tab}
                          {tab === "reviews" && ` (${astrologer.reviewsCount})`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                  className="space-y-6"
                >
                  {/* --- ABOUT TAB --- */}
                  {activeTab === "about" && (
                    <>
                      {/* Bio */}
                      {astrologer.loginBio && (
                        <motion.div variants={itemVariants} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                            <BookOpen className="h-5 w-5 text-orange-500" />
                            About Me
                          </h3>
                          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {astrologer.loginBio}
                          </p>
                        </motion.div>
                      )}

                      {/* Stats Grid */}
                      <motion.div variants={itemVariants}>
                        <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white">Activity Stats</h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                            {[
                              { label: "Followers", value: astrologer.stats.followerCount },
                              { label: "Reviews", value: astrologer.stats.reviewCount },
                              { label: "Chats", value: astrologer.stats.chatRequestCount },
                              { label: "Calls", value: astrologer.stats.callRequestCount },
                              { label: "Orders", value: astrologer.stats.orderCount },
                            ].map((stat, i) => (
                              <div key={i} className="flex flex-col items-center justify-center rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  {stat.value >= 1000 ? `${(stat.value / 1000).toFixed(1)}k` : stat.value}
                                </span>
                                <span className="text-xs text-gray-500">{stat.label}</span>
                              </div>
                            ))}
                        </div>
                      </motion.div>

                      {/* Education & Quals */}
                      {(astrologer.highestQualification || astrologer.college) && (
                        <motion.div variants={itemVariants} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                            <GraduationCap className="h-5 w-5 text-orange-500" />
                            Education
                          </h3>
                          <div className="grid gap-6 sm:grid-cols-2">
                             {astrologer.highestQualification && (
                               <div>
                                 <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Qualification</p>
                                 <p className="font-medium text-gray-900 dark:text-white">{astrologer.highestQualification}</p>
                               </div>
                             )}
                             {astrologer.degree && (
                               <div>
                                 <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Degree</p>
                                 <p className="font-medium text-gray-900 dark:text-white">{astrologer.degree}</p>
                               </div>
                             )}
                             {astrologer.college && (
                               <div className="sm:col-span-2">
                                 <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">College/Institute</p>
                                 <p className="font-medium text-gray-900 dark:text-white">{astrologer.college}</p>
                               </div>
                             )}
                          </div>
                        </motion.div>
                      )}

                      {/* Why I'm Here */}
                      {(astrologer.whatwillDo || astrologer.whyOnBoard) && (
                         <div className="grid gap-4 sm:grid-cols-2">
                           {astrologer.whatwillDo && (
                             <motion.div variants={itemVariants} className="rounded-2xl bg-orange-50/50 p-5 ring-1 ring-orange-100 dark:bg-orange-900/10 dark:ring-orange-900/20">
                               <h4 className="mb-2 font-bold text-gray-900 dark:text-white">What I Do</h4>
                               <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{astrologer.whatwillDo}</p>
                             </motion.div>
                           )}
                           {astrologer.whyOnBoard && (
                             <motion.div variants={itemVariants} className="rounded-2xl bg-blue-50/50 p-5 ring-1 ring-blue-100 dark:bg-blue-900/10 dark:ring-blue-900/20">
                               <h4 className="mb-2 font-bold text-gray-900 dark:text-white">Why I'm Here</h4>
                               <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{astrologer.whyOnBoard}</p>
                             </motion.div>
                           )}
                         </div>
                      )}
                    </>
                  )}

                  {/* --- REVIEWS TAB --- */}
                  {activeTab === "reviews" && (
                    <motion.div variants={itemVariants} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 sm:p-6">
                      <div className="mb-6 flex items-center justify-between">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white">Client Stories</h3>
                         <div className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-bold">{astrologer.avgRating?.toFixed(1) || "N/A"}</span>
                         </div>
                      </div>
                      
                      <div className="space-y-6">
                        {displayReviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0 dark:border-gray-800">
                             <div className="flex gap-4">
                               <div className="shrink-0">
                                 <img
                                   src={avatar(review.user?.profile)}
                                   alt={review.user?.name || "User"}
                                   className="h-10 w-10 rounded-full object-cover bg-gray-100"
                                 />
                               </div>
                               <div className="flex-1">
                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{review.user?.name || "Anonymous"}</h4>
                                    <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                                 </div>
                                 
                                 <div className="my-1 flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : "text-gray-200 dark:text-gray-700"}`} />
                                    ))}
                                 </div>

                                 <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{review.review}</p>
                                 
                                 {review.reply && (
                                   <div className="mt-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                                     <p className="mb-1 text-xs font-bold text-orange-600 dark:text-orange-400">Astrologer's Reply:</p>
                                     <p className="text-xs text-gray-600 dark:text-gray-400">{review.reply}</p>
                                   </div>
                                 )}
                               </div>
                             </div>
                          </div>
                        ))}
                      </div>

                      {astrologer.reviews.length > 5 && (
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="mt-6 w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {showAllReviews ? "Show Less" : `View All ${astrologer.reviewsCount} Reviews`}
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* --- AVAILABILITY TAB --- */}
                  {activeTab === "availability" && (
                    <motion.div variants={itemVariants} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                       <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                          <Calendar className="h-5 w-5 text-orange-500" />
                          Availability
                       </h3>
                       <div className="grid gap-3 sm:grid-cols-2">
                          {astrologer.availabilities.map((avail) => (
                             <div key={avail.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
                                <span className="font-medium text-gray-900 dark:text-white">{avail.day}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                   {avail.fromTime && avail.toTime ? (
                                     <span className="inline-flex items-center gap-1">
                                       <Clock className="h-3 w-3" /> {avail.fromTime} - {avail.toTime}
                                     </span>
                                   ) : (
                                     <span className="text-red-500 text-xs font-medium">Off</span>
                                   )}
                                </span>
                             </div>
                          ))}
                       </div>
                    </motion.div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Pricing & Extra Info (Desktop Only Sticky) */}
            <div className="space-y-6 lg:col-span-1">
               <div className="sticky top-24 space-y-6">
                 
                 {/* Service Rates Card */}
                 <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                    <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">Consultation Charges</h3>
                    <div className="space-y-3">
                       <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                          <div className="flex items-center gap-3">
                             <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                               <MessageSquare className="h-4 w-4" />
                             </div>
                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat</span>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">₹{astrologer.charge}/min</span>
                       </div>

                       <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                          <div className="flex items-center gap-3">
                             <div className="rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                               <Phone className="h-4 w-4" />
                             </div>
                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Call</span>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">₹{astrologer.charge}/min</span>
                       </div>

                       {astrologer.videoCallRate && (
                         <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                               <div className="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                 <Video className="h-4 w-4" />
                               </div>
                               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Video</span>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">₹{astrologer.videoCallRate}/min</span>
                         </div>
                       )}

                       {astrologer.reportRate && (
                         <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                               <div className="rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                 <BookOpen className="h-4 w-4" />
                               </div>
                               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Report</span>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">₹{astrologer.reportRate}</span>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Share Card (Optional Polish) */}
                 <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="font-bold">Share Profile</p>
                          <p className="text-xs text-gray-400">Spread the word</p>
                       </div>
                       <button 
                         onClick={() => {
                           if (navigator.share) {
                             navigator.share({ title: astrologer.name, url: window.location.href });
                           }
                         }}
                         className="rounded-full bg-white/10 p-2 hover:bg-white/20"
                       >
                          <Share2 className="h-5 w-5" />
                       </button>
                    </div>
                 </div>

               </div>
            </div>

          </div>
        </section>

        {/* === Mobile Floating Action Button (Sticky Bottom) === */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:border-gray-800 dark:bg-gray-900 md:hidden">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">Consult for</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">₹{astrologer.charge}<span className="text-xs font-normal text-gray-500">/min</span></span>
             </div>
             <button
               onClick={redirectToAppStore}
               className="flex-1 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] py-3 text-sm font-bold text-white shadow-md active:scale-95"
             >
               Start Consultation
             </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="mx-auto mt-12 max-w-xs text-center pb-20 md:pb-0">
          <Link
            href="/talk-to-astrologers"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Astrologers
          </Link>
        </div>

      </main>
      
      {/* Utility to hide scrollbar but keep functionality */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </LandingWrapper>
  );
}