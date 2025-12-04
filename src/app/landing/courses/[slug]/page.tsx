"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LandingWrapper from "@/components/landing/LandingWrapper";
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
    Package,
    Sparkles,
    Lock,
    ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";

interface Chapter {
    id: number;
    title: string;
    description: string | null;
    isPaid: boolean;
    content: {
        pdf: {
            type: string | null;
            url: string;
        } | null;
        image: {
            type: string | null;
            url: string;
        } | null;
        video: {
            type: string | null;
            url: string;
            format: string | null;
        } | null;
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
    recentEnrollments: Array<{
        id: number;
        userId: number;
        price: number | null;
        status: string;
        enrolledAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
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

interface SEOData {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    schemaJson: string;
}

export default function CourseDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [relatedCourses, setRelatedCourses] = useState<RelatedCourse[]>([]);
    const [seoData, setSeoData] = useState<SEOData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
    const [showEnrollPopup, setShowEnrollPopup] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "about">("overview");

    useEffect(() => {
        if (slug) {
            fetchCourseDetails();
        }
    }, [slug]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/landing/courses/${slug}`);
            const data = await response.json();

            if (data.success) {
                setCourse(data.data.course);
                setRelatedCourses(data.data.relatedCourses);
                setSeoData(data.data.seo);
            }
        } catch (error) {
            console.error("Failed to fetch course details:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleChapter = (chapterId: number) => {
        setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
    };

    if (loading) {
        return (
            <LandingWrapper>
                <div className="min-h-screen flex items-center justify-center">
                    <motion.div
                        className="flex flex-col items-center gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
                    </motion.div>
                </div>
            </LandingWrapper>
        );
    }

    if (!course) {
        return (
            <LandingWrapper>
                <div className="min-h-screen flex items-center justify-center">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Package className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Course Not Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            The course you're looking for doesn't exist.
                        </p>
                        <Link href="/landing/courses">
                            <motion.button
                                className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Browse All Courses
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </LandingWrapper>
        );
    }

    return (
        <>
            <Head>
                <title>{seoData?.metaTitle}</title>
                <meta name="description" content={seoData?.metaDescription} />
                <meta name="keywords" content={seoData?.metaKeywords} />
                <link rel="canonical" href={seoData?.canonicalUrl} />

                {/* Open Graph */}
                <meta property="og:title" content={seoData?.ogTitle} />
                <meta property="og:description" content={seoData?.ogDescription} />
                <meta property="og:image" content={seoData?.ogImage} />
                <meta property="og:type" content="website" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData?.twitterTitle} />
                <meta name="twitter:description" content={seoData?.twitterDescription} />
                <meta name="twitter:image" content={seoData?.twitterImage} />

                {/* Schema.org JSON-LD */}
                {seoData?.schemaJson && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: seoData.schemaJson }}
                    />
                )}
            </Head>

            {/* Enrollment Popup */}
            <AnimatePresence>
                {showEnrollPopup && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEnrollPopup(false)}
                        />

                        {/* Popup */}
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] p-6 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-2xl font-bold">Download Our App</h3>
                                        <button
                                            onClick={() => setShowEnrollPopup(false)}
                                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <p className="text-white/90 text-sm">
                                        To enroll in this course, please download our mobile app
                                    </p>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    {/* App Store */}
                                    <a
                                        href="https://apps.apple.com/in/app/gyanitalk/id6742021396"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Download on</div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">App Store</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all" />
                                    </a>

                                    {/* Play Store */}
                                    <a
                                        href="https://play.google.com/store/apps/details?id=com.app.gyanitalk&pcampaignid=web_share"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] rounded-xl hover:shadow-lg transition-all"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-7 h-7 text-[#FF6B35]" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-white/80">Get it on</div>
                                            <div className="text-lg font-bold text-white">Google Play</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-all" />
                                    </a>
                                </div>

                                {/* Footer */}
                                <div className="px-6 pb-6">
                                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <Award className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            Get exclusive features, offline access, and seamless learning experience on our mobile app!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <LandingWrapper>
                {/* Hero Section */}
                <section className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                        }} />
                    </div>

                    {/* Floating Particles */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0.2, 0.5, 0.2],
                                scale: [1, 1.5, 1],
                                x: [0, Math.random() * 40 - 20, 0],
                                y: [0, Math.random() * 40 - 20, 0],
                            }}
                            transition={{
                                duration: 10 + i,
                                repeat: Infinity,
                                delay: i * 0.5,
                            }}
                            style={{
                                left: `${10 + (i % 4) * 25}%`,
                                top: `${10 + Math.floor(i / 4) * 40}%`,
                            }}
                        >
                            <div className="w-2 h-2 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-sm" />
                        </motion.div>
                    ))}

                    <div className="relative z-10 max-w-7xl mx-auto">
                        {/* Breadcrumb */}
                        <motion.div
                            className="flex items-center gap-2 text-sm mb-6"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Link href="/landing/courses" className="text-gray-500 hover:text-[#FF6B35] transition-colors">
                                Courses
                            </Link>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            {course.category && (
                                <>
                                    <span className="text-gray-500">{course.category.name}</span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </>
                            )}
                            <span className="text-gray-900 dark:text-white font-medium truncate">{course.name}</span>
                        </motion.div>

                        <div className="grid lg:grid-cols-2 gap-12 items-start">
                            {/* left - Image */}
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <motion.div
                                    className="relative h-48 sm:h-60 md:h-72 lg:h-80 xl:h-96 rounded-2xl overflow-hidden shadow-xl"
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ duration: 0.3 }}
                                >

                                    {course.image ? (
                                        <img
                                            src={avatar(course.image)}
                                            alt={course.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center">
                                            <BookOpen className="w-24 h-24 text-white opacity-50" />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {/* Play Button Overlay */}
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                    >
                                        <motion.div
                                            className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <PlayCircle className="w-10 h-10 text-white" />
                                        </motion.div>
                                    </motion.div>
                                </motion.div>

                                {/* Floating Stats Cards */}
                                <motion.div
                                    className="absolute -bottom-2 -left-2 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md 
               rounded-lg shadow-md border border-gray-200/60 dark:border-gray-700/60 
               scale-75 sm:scale-90"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 0.95 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-md 
                        flex items-center justify-center">
                                            <Star className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">4.8</div>
                                            <div className="text-[10px] text-gray-500">Rating</div>
                                        </div>
                                    </div>
                                </motion.div>

                            </motion.div>
                            {/* right - Content */}
                            <motion.div
                                className="space-y-6"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {course.isPaid === 0 ? (
                                        <motion.div
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            FREE COURSE
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-xs font-bold rounded-full"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <Award className="w-3 h-3" />
                                            PREMIUM
                                        </motion.div>
                                    )}
                                    {course.category && (
                                        <div className="px-3 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                                            {course.category.name}
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {course.name}
                                </h1>

                                {/* Price & CTA */}
                                <motion.div
                                    className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl"
                                    whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            {course.isPaid === 1 ? (
                                                <div className="flex items-baseline gap-3">
                                                    {course.offerPrice !== null && course.offerPrice < (course.price || 0) ? (
                                                        <>
                                                            <div className="text-4xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                                                ₹{course.offerPrice}
                                                            </div>
                                                            <div className="text-xl text-gray-400 line-through">
                                                                ₹{course.price}
                                                            </div>
                                                            {course.discount > 0 && (
                                                                <div className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-lg">
                                                                    {course.discount}% OFF
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="text-4xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                                            ₹{course.price}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                                    FREE
                                                </div>
                                            )}
                                            {course.statistics.freeChapters > 0 && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {course.statistics.freeChapters} chapters available for free
                                                </p>
                                            )}
                                        </div>

                                        <motion.button
                                            onClick={() => setShowEnrollPopup(true)}
                                            className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                                            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255, 107, 53, 0.3)" }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <PlayCircle className="w-5 h-5" />
                                            Enroll Now
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>


                        </div>
                    </div>
                </section>

                {/* Tabs Section */}
                <section className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Tab Navigation */}
                        <motion.div
                            className="flex gap-2 mb-8 overflow-x-auto pb-2"
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
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                                        : "bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300"
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <tab.icon className="w-4 h-4" />
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
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {/* What You'll Learn */}
                                        <div className="md:col-span-2 space-y-6">
                                            <motion.div
                                                className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl"
                                                whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                                            >
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                                    What You'll Learn
                                                </h2>
                                                <div className="grid sm:grid-cols-2 gap-4">
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
                                                            className="flex items-start gap-3"
                                                            initial={{ opacity: 0, x: -20 }}
                                                            whileInView={{ opacity: 1, x: 0 }}
                                                            viewport={{ once: true }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                                {item}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>

                                            {/* Course Includes */}
                                            <motion.div
                                                className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl"
                                                whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                                            >
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                                    This Course Includes
                                                </h2>
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    {[
                                                        { icon: PlayCircle, text: `${course.statistics.totalChapters} video lectures` },
                                                        { icon: FileText, text: "Downloadable resources" },
                                                        { icon: Award, text: "Certificate of completion" },
                                                        { icon: Clock, text: "Lifetime access" },
                                                        { icon: Users, text: "Student community" },
                                                        { icon: Download, text: "Mobile and desktop access" },
                                                    ].map((item, index) => (
                                                        <motion.div
                                                            key={index}
                                                            className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl"
                                                            initial={{ opacity: 0, x: -20 }}
                                                            whileInView={{ opacity: 1, x: 0 }}
                                                            viewport={{ once: true }}
                                                            transition={{ delay: index * 0.1 }}
                                                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 107, 53, 0.1)" }}
                                                        >
                                                            <item.icon className="w-5 h-5 text-[#FF6B35]" />
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
                                                className="p-6 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl"
                                                whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                                            >
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                                    Course Stats
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Chapters</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{course.statistics.totalChapters}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Free Chapters</span>
                                                        <span className="font-bold text-green-500">{course.statistics.freeChapters}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Students Enrolled</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{course.statistics.totalEnrollments}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Active Students</span>
                                                        <span className="font-bold text-blue-500">{course.statistics.activeEnrollments}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                                                        <span className="font-bold text-[#FF6B35]">{course.statistics.conversionRate}%</span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className="p-6 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-2xl text-white"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <h3 className="text-lg font-bold mb-2">Limited Time Offer</h3>
                                                <p className="text-sm opacity-90 mb-4">
                                                    Enroll now and get lifetime access to all course materials
                                                </p>
                                                <motion.button
                                                    onClick={() => setShowEnrollPopup(true)}
                                                    className="w-full py-3 bg-white text-[#FF6B35] font-bold rounded-xl"
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
                                        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6"
                                        whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                                    >
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            Course Curriculum
                                        </h2>
                                        <div className="space-y-3">
                                            {course.chapters.map((chapter, index) => (
                                                <motion.div
                                                    key={chapter.id}
                                                    className="border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: index * 0.05 }}
                                                    whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                                                >
                                                    <button
                                                        onClick={() => toggleChapter(chapter.id)}
                                                        className="w-full p-4 flex items-center justify-between bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div className="text-left flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                        {chapter.title}
                                                                    </h3>
                                                                    {chapter.isPaid ? (
                                                                        <Lock className="w-4 h-4 text-gray-400" />
                                                                    ) : (
                                                                        <div className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">
                                                                            FREE
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {chapter.description && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                                        {chapter.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <motion.div
                                                            animate={{ rotate: expandedChapter === chapter.id ? 180 : 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <ChevronDown className="w-5 h-5 text-gray-400" />
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
                                                                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200/60 dark:border-gray-700/60">
                                                                    {chapter.description && (
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                                            {chapter.description}
                                                                        </p>
                                                                    )}

                                                                    {chapter.hasContent && (
                                                                        <div className="space-y-2">
                                                                            <p className="text-xs font-semibold text-gray-500 uppercase">
                                                                                Available Content
                                                                            </p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {chapter.content.video && (
                                                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-white/10 rounded-lg text-xs">
                                                                                        <PlayCircle className="w-3 h-3 text-[#FF6B35]" />
                                                                                        <span className="text-gray-700 dark:text-gray-300">Video</span>
                                                                                    </div>
                                                                                )}
                                                                                {chapter.content.pdf && (
                                                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-white/10 rounded-lg text-xs">
                                                                                        <FileText className="w-3 h-3 text-blue-500" />
                                                                                        <span className="text-gray-700 dark:text-gray-300">PDF</span>
                                                                                    </div>
                                                                                )}
                                                                                {chapter.content.image && (
                                                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-white/10 rounded-lg text-xs">
                                                                                        <ImageIcon className="w-3 h-3 text-purple-500" />
                                                                                        <span className="text-gray-700 dark:text-gray-300">Image</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <motion.button
                                                                        className={`mt-4 w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${chapter.isPaid
                                                                            ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                                                                            : "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                                                                            }`}
                                                                        disabled={chapter.isPaid}
                                                                        whileHover={!chapter.isPaid ? { scale: 1.02 } : {}}
                                                                        whileTap={!chapter.isPaid ? { scale: 0.98 } : {}}
                                                                    >
                                                                        {chapter.isPaid ? (
                                                                            <>
                                                                                <Lock className="w-4 h-4" />
                                                                                Enroll to Access
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <PlayCircle className="w-4 h-4" />
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
                                        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6"
                                        whileHover={{ borderColor: "rgba(255, 107, 53, 0.5)" }}
                                    >
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            About This Course
                                        </h2>
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                    Course Description
                                                </h3>
                                                <div
                                                    className="text-gray-600 dark:text-gray-400 leading-relaxed"
                                                    dangerouslySetInnerHTML={{
                                                        __html: course.description
                                                            || "This comprehensive course will guide you through all aspects of the subject matter with expert instruction and practical examples."
                                                    }}
                                                />

                                            </div>

                                            {course.category && (
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                        Category
                                                    </h3>
                                                    <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                                                        {course.category.image && (
                                                            <img
                                                                src={avatar(course.category.image)}
                                                                alt={course.category.name}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                        )}
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {course.category.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                    Who Should Take This Course?
                                                </h3>
                                                <div className="space-y-2">
                                                    {[
                                                        "Beginners interested in astrology",
                                                        "Practitioners looking to deepen their knowledge",
                                                        "Anyone curious about Vedic sciences",
                                                        "Students seeking structured learning"
                                                    ].map((item, index) => (
                                                        <div key={index} className="flex items-start gap-3">
                                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                                {item}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                    Requirements
                                                </h3>
                                                <div className="space-y-2">
                                                    {[
                                                        "Basic understanding of astrology (helpful but not required)",
                                                        "Internet connection for video content",
                                                        "Dedication to learn and practice",
                                                        "Open mind and curiosity"
                                                    ].map((item, index) => (
                                                        <div key={index} className="flex items-start gap-3">
                                                            <div className="w-5 h-5 flex items-center justify-center text-[#FF6B35] font-bold flex-shrink-0 mt-0.5">
                                                                •
                                                            </div>
                                                            <span className="text-gray-700 dark:text-gray-300 text-sm">
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
                    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02]">
                        <div className="max-w-7xl mx-auto">
                            <motion.div
                                className="text-center mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Related Courses
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Explore more courses in {course.category?.name || "this category"}
                                </p>
                            </motion.div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedCourses.map((relatedCourse, index) => (
                                    <motion.div
                                        key={relatedCourse.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link href={`/landing/courses/${relatedCourse.slug}`}>
                                            <motion.div
                                                className="group bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden h-full"
                                                whileHover={{
                                                    scale: 1.03,
                                                    borderColor: "rgba(255, 107, 53, 0.5)",
                                                    boxShadow: "0 10px 30px rgba(255, 107, 53, 0.15)"
                                                }}
                                            >
                                                <div className="relative h-40 overflow-hidden">
                                                    {relatedCourse.image ? (
                                                        <img
                                                            src={avatar(relatedCourse.image)}
                                                            alt={relatedCourse.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center">
                                                            <BookOpen className="w-12 h-12 text-white opacity-50" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#FF6B35] transition-colors">
                                                        {relatedCourse.name}
                                                    </h3>
                                                    {relatedCourse.description && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                            {relatedCourse.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        {relatedCourse.isPaid === 1 ? (
                                                            <div className="flex items-baseline gap-2">
                                                                {relatedCourse.offerPrice !== null && relatedCourse.offerPrice < (relatedCourse.price || 0) ? (
                                                                    <>
                                                                        <span className="text-lg font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                                                            ₹{relatedCourse.offerPrice}
                                                                        </span>
                                                                        <span className="text-sm text-gray-400 line-through">
                                                                            ₹{relatedCourse.price}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-lg font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                                                        ₹{relatedCourse.price}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                                                Free
                                                            </span>
                                                        )}
                                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all" />
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