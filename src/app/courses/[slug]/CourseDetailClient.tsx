
"use client";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Award,
  Users,
  PlayCircle,
  FileText,
  Image as ImageIcon,
  Lock,
  ChevronDown,
  Star,
  Share2,
  CheckCircle2,
  BarChart3,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import Image from "next/image";

/* ================= TYPES (Kept Intact) ================= */

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

export default function CourseDetailClient({
  course,
  relatedCourses,
}: {
  course: Course;
  relatedCourses: RelatedCourse[];
}) {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum">("overview");

  useEffect(() => {
    if (!course) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "course_schema",
      schema_type: "course",
      name: course.name,
      id: course.id,
      price: course.offerPrice ?? course.price ?? 0,
      currency: "INR",
    });
  }, [course]);

  const toggleChapter = (chapterId: number) => {
    setExpandedChapter((prev) => (prev === chapterId ? null : chapterId));
  };

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
    window.open("https://play.google.com/store/apps/details?id=com.app.gyanitalk", "_blank", "noopener,noreferrer");
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <LandingWrapper>
      <div className="bg-gray-50 min-h-screen pb-20 dark:bg-gray-900">
        
        {/* Breadcrumb Header */}
        <div className="pt-24 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap no-scrollbar">
            <Link href="/" className="hover:text-[#FF6B35] transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
            <Link href="/courses" className="hover:text-[#FF6B35] transition-colors">Courses</Link>
            {course.category && (
              <>
                <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
                <span className="hover:text-[#FF6B35] transition-colors cursor-pointer">{course.category.name}</span>
              </>
            )}
            <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />
            <span className="font-medium text-gray-900 dark:text-gray-200 truncate">{course.name}</span>
          </nav>

          {/* Main Product Grid */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Image & Tabs */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Product Image Card */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-700"
                initial="hidden" animate="visible" variants={fadeIn}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900">
                  {course.image ? (
                    <Image
                      src={avatar(course.image)}
                      alt={course.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                      <ImageIcon className="h-16 w-16 opacity-50" />
                    </div>
                  )}
                  {course.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-xs font-bold text-[#FF6B35] shadow-lg">
                      -{course.discount}% OFF
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Tabs Section - Moved below image for better flow */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-4 px-4 text-sm font-semibold transition-all relative ${
                      activeTab === "overview"
                        ? "text-[#FF6B35]"
                        : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
                    }`}
                  >
                    Overview
                    {activeTab === "overview" && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35]" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("curriculum")}
                    className={`pb-4 px-4 text-sm font-semibold transition-all relative ${
                      activeTab === "curriculum"
                        ? "text-[#FF6B35]"
                        : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
                    }`}
                  >
                    Curriculum ({course.chapters.length})
                    {activeTab === "curriculum" && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35]" />
                    )}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "overview" ? (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                        <div dangerouslySetInnerHTML={{ __html: course.description || "<p>No description available.</p>" }} />
                      </div>
                      
                      {/* Course Highlights based on stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4">
                         <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-[#FF6B35]">
                              <BookOpen size={20} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Chapters</p>
                              <p className="font-bold text-gray-900 dark:text-white">{course.statistics.totalChapters} Lessons</p>
                            </div>
                         </div>
                         <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                              <Users size={20} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Students</p>
                              <p className="font-bold text-gray-900 dark:text-white">{course.statistics.totalEnrollments} Enrolled</p>
                            </div>
                         </div>
                         <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                              <Award size={20} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Certificate</p>
                              <p className="font-bold text-gray-900 dark:text-white">On Completion</p>
                            </div>
                         </div>
                         <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                              <Clock size={20} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Access</p>
                              <p className="font-bold text-gray-900 dark:text-white">Lifetime</p>
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="curriculum"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {course.chapters.map((chapter, idx) => (
                        <div 
                          key={chapter.id} 
                          className={`border rounded-xl overflow-hidden transition-all ${expandedChapter === chapter.id ? 'border-[#FF6B35] bg-orange-50/10' : 'border-gray-200 dark:border-gray-700'}`}
                        >
                          <button
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-500">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                                  {chapter.title}
                                </h4>
                                {chapter.description && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{chapter.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {!chapter.isPaid ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Free</span>
                              ) : (
                                <Lock className="w-4 h-4 text-gray-400" />
                              )}
                              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedChapter === chapter.id ? 'rotate-180' : ''}`} />
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {expandedChapter === chapter.id && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 pt-0 pl-16 text-sm text-gray-600 dark:text-gray-400 border-t border-dashed border-gray-200 dark:border-gray-700">
                                  <div className="pt-4 flex flex-wrap gap-3">
                                    {chapter.hasContent && (
                                      <>
                                        {chapter.content.video && <div className="flex items-center gap-1.5"><PlayCircle className="w-3.5 h-3.5 text-[#FF6B35]"/> Video Lesson</div>}
                                        {chapter.content.pdf && <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-500"/> Reading Material</div>}
                                      </>
                                    )}
                                    <button 
                                      onClick={redirectToAppStore}
                                      className="ml-auto text-xs font-semibold text-[#FF6B35] hover:underline"
                                    >
                                      {chapter.isPaid ? "Unlock in App" : "Play Now"}
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT COLUMN: Info & Action */}
            <div className="lg:col-span-5 relative">
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 sticky top-24"
                initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}
              >
                {/* Category Badge */}
                {course.category && (
                  <div className="mb-4 flex justify-between items-start">
                    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                      {course.category.name}
                    </span>
                    <button className="text-gray-400 hover:text-[#FF6B35] transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                  {course.name}
                </h1>

                {/* Reviews */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">4.8</span>
                  <span className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-2">
                    ({course.statistics.activeEnrollments + 40} reviews)
                  </span>
                </div>

                {/* Pricing Area */}
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                  <div className="flex items-baseline gap-2 mb-1">
                    {course.isPaid === 1 ? (
                      <>
                        <span className="text-4xl font-extrabold text-[#FF6B35]">
                          ₹{course.offerPrice ?? course.price}
                        </span>
                        {course.offerPrice && course.price && course.offerPrice < course.price && (
                          <span className="text-lg text-gray-400 line-through decoration-2">
                            ₹{course.price}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-4xl font-extrabold text-green-500">Free</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    One-time payment. Full lifetime access.
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={redirectToAppStore}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e05a2b] text-white text-lg font-bold py-4 px-8 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-200 transform hover:-translate-y-0.5 active:scale-95"
                >
                  <PlayCircle className="w-5 h-5" />
                  {course.isPaid === 1 ? "Enroll Now" : "Start Learning"}
                </button>

                <div className="mt-4 text-center">
                   <p className="text-xs text-gray-500">Download the app to access content</p>
                </div>

                {/* Quick Points */}
                <div className="mt-8 space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Access on Mobile & Tablet</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Beginner to Advanced Level</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Related Courses Section */}
        {relatedCourses.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">You might also like</h2>
              <Link href="/courses" className="text-sm font-semibold text-[#FF6B35] flex items-center hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCourses.map((rc) => (
                <Link href={`/courses/${rc.slug}`} key={rc.id} className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg hover:border-orange-200">
                    <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                      {rc.image ? (
                        <Image src={avatar(rc.image)} alt={rc.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-1 group-hover:text-[#FF6B35] transition-colors">
                        {rc.name}
                      </h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {rc.isPaid ? `₹${rc.offerPrice ?? rc.price}` : <span className="text-green-600">Free</span>}
                        </span>
                        <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-lg group-hover:bg-[#FF6B35] group-hover:text-white transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </LandingWrapper>
  );
}