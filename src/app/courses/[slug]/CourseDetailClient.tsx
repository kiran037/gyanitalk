"use client";

import { useState } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Award,
  Users,
  Clock,
  CheckCircle,
  PlayCircle,
  FileText,
  Image as ImageIcon,
  Download,
  Star,
  Sparkles,
  Lock,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import Image from "next/image";

/* ================= TYPES ================= */

interface Chapter {
  id: number;
  title: string;
  description: string | null;
  isPaid: boolean;
  content: {
    pdf: { type: string | null; url: string } | null;
    image: { type: string | null; url: string } | null;
    video: { type: string | null; url: string; format: string | null } | null;
  };
  hasContent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number | null;
  offerPrice: number | null;
  discount: number;
  isPaid: number;
  category: {
    id: number;
    name: string;
    image: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  chapters: Chapter[];
  statistics: {
    totalChapters: number;
    freeChapters: number;
    paidChapters: number;
    totalEnrollments: number;
    activeEnrollments: number;
    totalRevenue: number;
    conversionRate: number;
  };
}

interface RelatedCourse {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number | null;
  offerPrice: number | null;
  description: string | null;
  isPaid: number;
}

/* ================= COMPONENT ================= */

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.app.gyanitalk&pcampaignid=web_share";
const APP_STORE_URL =
  "https://apps.apple.com/in/app/gyanitalk/id6742021396";

export default function CourseDetailClient({
  course,
  relatedCourses,
}: {
  course: Course;
  relatedCourses: RelatedCourse[];
}) {
  const prefersReducedMotion = useReducedMotion();

  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [showEnrollPopup, setShowEnrollPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "about">(
    "overview",
  );

  const toggleChapter = (chapterId: number) => {
    setExpandedChapter((prev) => (prev === chapterId ? null : chapterId));
  };

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
    <>
      {/* Enrollment popup, modals, animations — KEEP HERE */}

      <AnimatePresence>
        {showEnrollPopup && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEnrollPopup(false)}
          />
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTENT ================= */}
      <LandingWrapper>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:px-8">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Floating Particles – only on sm+ and when motion allowed */}
          {!prefersReducedMotion && (
            <div className="hidden sm:block">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="pointer-events-none absolute"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.5, 1],
                    x: [0, (i % 2 === 0 ? 1 : -1) * 20, 0],
                    y: [0, (i % 3 === 0 ? 1 : -1) * 20, 0],
                  }}
                  transition={{
                    duration: 10 + i,
                    repeat: prefersReducedMotion ? 0 : Infinity,
                    delay: i * 0.5,
                  }}
                  style={{
                    left: `${10 + (i % 4) * 25}%`,
                    top: `${10 + Math.floor(i / 4) * 40}%`,
                  }}
                >
                  <div className="h-2 w-2 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] blur-sm" />
                </motion.div>
              ))}
            </div>
          )}

          <div className="relative z-10 mx-auto max-w-7xl">
            {/* Breadcrumb */}
            <motion.div
              className="mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs sm:mb-6 sm:text-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                href="/courses"
                className="text-gray-500 transition-colors hover:text-[#FF6B35]"
              >
                Courses
              </Link>
              <ChevronRight
                className="h-4 w-4 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {course.category && (
                <>
                  <span className="text-gray-500">{course.category.name}</span>
                  <ChevronRight
                    className="h-4 w-4 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                </>
              )}
              <span className="max-w-xs truncate font-medium text-gray-900 dark:text-white sm:max-w-md">
                {course.name}
              </span>
            </motion.div>

            <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Left - Image */}
              <motion.div
                className="relative order-1 lg:order-none"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="relative h-48 overflow-hidden rounded-2xl bg-gray-100 shadow-xl dark:bg-gray-900 sm:h-60 md:h-72 lg:h-80 xl:h-96"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  {course.image ? (
                    <Image
                      src={avatar(course.image)}
                      alt={course.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={true}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF6B35] to-[#FFB347]">
                      <BookOpen className="h-16 w-16 text-white opacity-60 sm:h-20 sm:w-20" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Play Button Overlay – only hover on md+ */}
                  {!prefersReducedMotion && (
                    <motion.div
                      className="absolute inset-0 hidden items-center justify-center md:flex"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <motion.div
                        className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-white/20 backdrop-blur-md md:h-20 md:w-20"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <PlayCircle className="h-8 w-8 text-white md:h-10 md:w-10" />
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Floating Stats Card */}
                <motion.div
                  className="absolute -bottom-3 -left-1 origin-bottom-left scale-75 rounded-lg border border-gray-200/60 bg-white/90 p-2 shadow-md backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-900/90 sm:-left-2 sm:scale-90"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#FF6B35] to-[#FFB347]">
                      <Star className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        4.8
                      </div>
                      <div className="text-[10px] text-gray-500">Rating</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right - Content */}
              <motion.div
                className="space-y-5 sm:space-y-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {course.isPaid === 0 ? (
                    <motion.div
                      className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 text-xs font-bold text-white"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Sparkles
                        className="h-4 w-4 text-white"
                        aria-hidden="true"
                      />
                      FREE COURSE
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-3 py-1.5 text-xs font-bold text-white"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Award
                        className="h-4 w-4 text-white"
                        aria-hidden="true"
                      />
                      PREMIUM
                    </motion.div>
                  )}
                  {course.category && (
                    <div className="rounded-full border border-gray-200/60 bg-white/60 px-3 py-1.5 text-xs font-medium text-gray-700 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300">
                      {course.category.name}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:text-3xl lg:text-4xl xl:text-5xl">
                  {course.name}
                </h1>

                {/* Price & CTA */}
                <motion.div
                  className="rounded-2xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-6"
                  whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {course.isPaid === 1 ? (
                        <div className="flex items-baseline gap-3">
                          {course.offerPrice !== null &&
                          course.offerPrice < (course.price || 0) ? (
                            <>
                              <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                                ₹{course.offerPrice}
                              </div>
                              <div className="text-lg text-gray-400 line-through sm:text-xl">
                                ₹{course.price}
                              </div>
                              {course.discount > 0 && (
                                <div className="rounded-lg bg-green-500 px-2 py-1 text-xs font-bold text-white">
                                  {course.discount}% OFF
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                              ₹{course.price}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                          FREE
                        </div>
                      )}
                      {course.statistics.freeChapters > 0 && (
                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                          {course.statistics.freeChapters} chapters available
                          for free
                        </p>
                      )}
                    </div>

                    <motion.button
                      onClick={redirectToAppStore}
                      aria-label={`Enroll in ${course.name}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-6 py-3 text-sm font-bold text-white shadow-lg sm:w-auto sm:px-8 sm:py-4 sm:text-base"
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 20px 40px rgba(255, 107, 53, 0.3)",
                      }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      Enroll Now
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Tab Navigation */}
            <motion.div
              className="mb-6 flex gap-2 overflow-x-auto pb-2 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {[
                { id: "overview", label: "Overview", icon: BookOpen },
                { id: "chapters", label: "Chapters", icon: FileText },
                { id: "about", label: "About", icon: Award },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all sm:px-6 sm:py-3 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                      : "border border-gray-200/60 bg-white/60 text-gray-700 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
                    {/* What You'll Learn */}
                    <div className="space-y-6 md:col-span-2">
                      <motion.div
                        className="rounded-2xl border border-gray-200/60 bg-white/60 p-5 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-6"
                        whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                      >
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-2xl">
                          What You'll Learn
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                          {[
                            "Master Vedic astrology fundamentals",
                            "Learn horoscope chart reading",
                            "Understand planetary positions",
                            "Predict future events accurately",
                            "Analyze birth charts professionally",
                            "Apply astrological remedies",
                          ].map((item, index) => (
                            <motion.div
                              key={index}
                              className="flex items-start gap-2.5"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true, amount: 0.3 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {item}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Course Includes */}
                      <motion.div
                        className="rounded-2xl border border-gray-200/60 bg-white/60 p-5 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-6"
                        whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                      >
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-2xl">
                          This Course Includes
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                          {[
                            {
                              icon: PlayCircle,
                              text: `${course.statistics.totalChapters} video lectures`,
                            },
                            { icon: FileText, text: "Downloadable resources" },
                            {
                              icon: Award,
                              text: "Certificate of completion",
                            },
                            { icon: Clock, text: "Lifetime access" },
                            { icon: Users, text: "Student community" },
                            {
                              icon: Download,
                              text: "Mobile and desktop access",
                            },
                          ].map((item, index) => (
                            <motion.div
                              key={index}
                              className="flex items-center gap-3 rounded-xl bg-gray-50/60 p-3 dark:bg-gray-800/50"
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true, amount: 0.3 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{
                                scale: 1.02,
                                backgroundColor: "rgba(255, 107, 53, 0.06)",
                              }}
                            >
                              <item.icon className="h-5 w-5 text-[#FF6B35]" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {item.text}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                      <motion.div
                        className="rounded-2xl border border-gray-200/60 bg-white/60 p-5 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-6"
                        whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                      >
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                          Course Stats
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Total Chapters
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {course.statistics.totalChapters}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Free Chapters
                            </span>
                            <span className="font-bold text-green-500">
                              {course.statistics.freeChapters}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Students Enrolled
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {course.statistics.totalEnrollments}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Active Students
                            </span>
                            <span className="font-bold text-blue-500">
                              {course.statistics.activeEnrollments}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Success Rate
                            </span>
                            <span className="font-bold text-[#FF6B35]">
                              {course.statistics.conversionRate}%
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FFB347] p-5 text-white sm:p-6"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h3 className="mb-2 text-lg font-bold">
                          Limited Time Offer
                        </h3>
                        <p className="mb-4 text-xs opacity-90 sm:text-sm">
                          Enroll now and get lifetime access to all course
                          materials
                        </p>
                        <motion.button
                          onClick={redirectToAppStore}
                          aria-label={`Enroll in ${course.name}`}
                          className="w-full rounded-xl bg-white py-3 text-sm font-bold text-[#FF6B35] sm:text-base"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Get Started
                        </motion.button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "chapters" && (
                <motion.div
                  key="chapters"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="rounded-2xl border border-gray-200/60 bg-white/60 p-5 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-6"
                    whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                  >
                    <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-2xl">
                      Course Curriculum
                    </h2>
                    <div className="space-y-3">
                      {course.chapters.map((chapter, index) => (
                        <motion.div
                          key={chapter.id}
                          className="overflow-hidden rounded-xl border border-gray-200/60 dark:border-gray-700/60"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{
                            borderColor: "rgba(255, 107, 53, 0.5)",
                          }}
                        >
                          <button
                            onClick={() => toggleChapter(chapter.id)}
                            className="flex w-full items-center justify-between bg-white/40 p-4 transition-colors hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10"
                          >
                            <div className="flex flex-1 items-center gap-3 sm:gap-4">
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FFB347] text-sm font-bold text-white sm:h-10 sm:w-10">
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <div className="mb-1 flex items-center gap-2">
                                  <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                                    {chapter.title}
                                  </h3>
                                  {chapter.isPaid ? (
                                    <Lock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                  ) : (
                                    <div className="flex-shrink-0 rounded bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                      FREE
                                    </div>
                                  )}
                                </div>
                                {chapter.description && (
                                  <p className="line-clamp-1 text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs">
                                    {chapter.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <motion.div
                              animate={{
                                rotate:
                                  expandedChapter === chapter.id ? 180 : 0,
                              }}
                              transition={{ duration: 0.25 }}
                            >
                              <ChevronDown
                                className="h-5 w-5 flex-shrink-0 text-gray-400"
                                aria-hidden="true"
                              />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {expandedChapter === chapter.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-gray-200/60 bg-gray-50/60 p-4 dark:border-gray-700/60 dark:bg-gray-800/50">
                                  {chapter.description && (
                                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                                      {chapter.description}
                                    </p>
                                  )}

                                  {chapter.hasContent && (
                                    <div className="space-y-2">
                                      <p className="text-[11px] font-semibold uppercase text-gray-500">
                                        Available Content
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {chapter.content.video && (
                                          <div className="flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-1.5 text-xs dark:bg-white/10">
                                            <PlayCircle className="h-3 w-3 text-[#FF6B35]" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                              Video
                                            </span>
                                          </div>
                                        )}
                                        {chapter.content.pdf && (
                                          <div className="flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-1.5 text-xs dark:bg-white/10">
                                            <FileText className="h-3 w-3 text-blue-500" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                              PDF
                                            </span>
                                          </div>
                                        )}
                                        {chapter.content.image && (
                                          <div className="flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-1.5 text-xs dark:bg-white/10">
                                            <ImageIcon className="h-3 w-3 text-purple-500" />
                                            <span className="text-gray-700 dark:text-gray-300">
                                              Image
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  <motion.button
                                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium ${
                                      chapter.isPaid
                                        ? "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700"
                                        : "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                                    }`}
                                    disabled={chapter.isPaid}
                                    whileHover={
                                      !chapter.isPaid ? { scale: 1.02 } : {}
                                    }
                                    whileTap={
                                      !chapter.isPaid ? { scale: 0.98 } : {}
                                    }
                                  >
                                    {chapter.isPaid ? (
                                      <>
                                        <Lock className="h-4 w-4" />
                                        Enroll to Access
                                      </>
                                    ) : (
                                      <>
                                        <PlayCircle className="h-4 w-4" />
                                        Start Chapter
                                      </>
                                    )}
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "about" && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="rounded-2xl border border-gray-200/60 bg-white/60 p-5 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 sm:p-6"
                    whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                  >
                    <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-2xl">
                      About This Course
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                          Course Description
                        </h3>
                        <div
                          className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base"
                          dangerouslySetInnerHTML={{
                            __html:
                              course.description ||
                              "This comprehensive course will guide you through all aspects of the subject matter with expert instruction and practical examples.",
                          }}
                        />
                      </div>

                      {course.category && (
                        <div>
                          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                            Category
                          </h3>
                          <div className="flex items-center gap-3 rounded-xl bg-gray-50/60 p-4 dark:bg-gray-800/50">
                            {course.category.image && (
                              <Image
                                src={avatar(course.category.image)}
                                alt={course.category.name}
                                width={48}
                                height={48}
                              />
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                              {course.category.name}
                            </span>
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                          Who Should Take This Course?
                        </h3>
                        <div className="space-y-2">
                          {[
                            "Beginners interested in astrology",
                            "Practitioners looking to deepen their knowledge",
                            "Anyone curious about Vedic sciences",
                            "Students seeking structured learning",
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 text-sm"
                            >
                              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                          Requirements
                        </h3>
                        <div className="space-y-2 text-sm">
                          {[
                            "Basic understanding of astrology (helpful but not required)",
                            "Internet connection for video content",
                            "Dedication to learn and practice",
                            "Open mind and curiosity",
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 text-sm"
                            >
                              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center font-bold text-[#FF6B35]">
                                •
                              </div>
                              <span className="text-gray-700 dark:text-gray-300">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <section className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 px-4 py-10 dark:from-white/[0.02] dark:to-white/[0.02] sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <motion.div
                className="mb-6 text-center sm:mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Related Courses
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                  Explore more courses in{" "}
                  {course.category?.name || "this category"}
                </p>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {relatedCourses.map((relatedCourse, index) => (
                  <motion.div
                    key={relatedCourse.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/courses/${relatedCourse.slug}`}>
                      <motion.div
                        className="group h-full overflow-hidden rounded-xl border border-gray-200/60 bg-white/70 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                        whileHover={{
                          scale: 1.03,
                          borderColor: "rgba(255, 107, 53, 0.5)",
                          boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)",
                        }}
                      >
                        <div className="relative h-36 overflow-hidden sm:h-40">
                          {relatedCourse.image ? (
                            <Image
                              src={avatar(relatedCourse.image)}
                              alt={relatedCourse.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 25vw"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF6B35] to-[#FFB347]">
                              <BookOpen className="h-10 w-10 text-white opacity-60" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="mb-2 line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-[#FF6B35] dark:text-white sm:text-base">
                            {relatedCourse.name}
                          </h3>
                          {relatedCourse.description && (
                            <p className="mb-3 line-clamp-2 text-[11px] text-gray-600 dark:text-gray-400 sm:text-xs">
                              {relatedCourse.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            {relatedCourse.isPaid === 1 ? (
                              <div className="flex items-baseline gap-2">
                                {relatedCourse.offerPrice !== null &&
                                relatedCourse.offerPrice <
                                  (relatedCourse.price || 0) ? (
                                  <>
                                    <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-base font-bold text-transparent">
                                      ₹{relatedCourse.offerPrice}
                                    </span>
                                    <span className="text-xs text-gray-400 line-through sm:text-sm">
                                      ₹{relatedCourse.price}
                                    </span>
                                  </>
                                ) : (
                                  <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-base font-bold text-transparent">
                                    ₹{relatedCourse.price}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-base font-bold text-transparent">
                                Free
                              </span>
                            )}
                            <ChevronRight
                              className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#FF6B35]"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </LandingWrapper>
    </>
  );
}
