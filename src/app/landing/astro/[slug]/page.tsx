
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { 
    Star, Clock, Languages, MapPin, Award, Calendar, GraduationCap, 
    Users, MessageSquare, Phone, Video, BookOpen, ArrowLeft, 
    ChevronRight, Sparkles
} from "lucide-react";
import Link from "next/link";
import { avatar } from "@/lib/images";
import Head from "next/head";
import { motion } from "framer-motion";

interface AstrologerSEO {
    slug: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
    ogType: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    twitterCard: string;
    schemaJson: string;
    breadcrumbSchema: string;
}

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
    seo: AstrologerSEO;
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

export default function AstrologerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    
    const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'availability'>('about');

    useEffect(() => {
        if (slug) {
            fetchAstrologer();
        }
    }, [slug]);

    useEffect(() => {
        if (astrologer?.seo) {
            document.title = astrologer.seo.metaTitle;

            const updateMetaTag = (name: string, content: string, isProperty = false) => {
                const attribute = isProperty ? 'property' : 'name';
                let element = document.querySelector(`meta[${attribute}="${name}"]`);
                if (!element) {
                    element = document.createElement('meta');
                    element.setAttribute(attribute, name);
                    document.head.appendChild(element);
                }
                element.setAttribute('content', content);
            };

            updateMetaTag('description', astrologer.seo.metaDescription);
            updateMetaTag('keywords', astrologer.seo.metaKeywords);
            updateMetaTag('og:title', astrologer.seo.ogTitle, true);
            updateMetaTag('og:description', astrologer.seo.ogDescription, true);
            updateMetaTag('og:image', astrologer.seo.ogImage, true);
            updateMetaTag('og:url', astrologer.seo.ogUrl, true);
            updateMetaTag('og:type', astrologer.seo.ogType, true);
            updateMetaTag('twitter:card', astrologer.seo.twitterCard);
            updateMetaTag('twitter:title', astrologer.seo.twitterTitle);
            updateMetaTag('twitter:description', astrologer.seo.twitterDescription);
            updateMetaTag('twitter:image', astrologer.seo.twitterImage);

            let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.rel = 'canonical';
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.href = `${window.location.origin}${astrologer.seo.canonicalUrl}`;

            let schemaScript = document.querySelector('script[type="application/ld+json"]#astro-schema') as HTMLScriptElement;
            if (!schemaScript) {
                schemaScript = document.createElement('script');
                schemaScript.type = 'application/ld+json';
                schemaScript.id = 'astro-schema';
                document.head.appendChild(schemaScript);
            }
            schemaScript.textContent = astrologer.seo.schemaJson;

            let breadcrumbScript = document.querySelector('script[type="application/ld+json"]#breadcrumb-schema') as HTMLScriptElement;
            if (!breadcrumbScript) {
                breadcrumbScript = document.createElement('script');
                breadcrumbScript.type = 'application/ld+json';
                breadcrumbScript.id = 'breadcrumb-schema';
                document.head.appendChild(breadcrumbScript);
            }
            breadcrumbScript.textContent = astrologer.seo.breadcrumbSchema;
        }
    }, [astrologer]);

    const fetchAstrologer = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/landing/astro/${slug}`);
            const data = await res.json();
            
            if (data.success) {
                setAstrologer(data.data);
            } else {
                setError(data.error || "Astrologer not found");
            }
        } catch (err) {
            console.error("Failed to fetch astrologer:", err);
            setError("Failed to load astrologer");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <LandingWrapper>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading astrologer details...</p>
                    </div>
                </div>
            </LandingWrapper>
        );
    }

    if (error || !astrologer) {
        return (
            <LandingWrapper>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <motion.div 
                        className="text-center max-w-md"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="w-16 h-16 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Astrologer Not Found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "The astrologer you're looking for doesn't exist."}</p>
                        <Link 
                            href="/landing/astro"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white font-medium rounded-xl shadow-lg hover:scale-105 transition-transform"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Astrologers
                        </Link>
                    </motion.div>
                </div>
            </LandingWrapper>
        );
    }

    const displayReviews = showAllReviews ? astrologer.reviews : astrologer.reviews.slice(0, 5);

    return (
        <>
            <Head>
                <title>{astrologer.seo.metaTitle}</title>
                <meta name="description" content={astrologer.seo.metaDescription} />
            </Head>

            <LandingWrapper>
                {/* Breadcrumb */}
                <section className="pt-24 pb-4 px-4 sm:px-6 lg:px-8">
                    <div className="w-full mx-auto">
                        <motion.nav 
                            className="flex items-center gap-2 text-sm"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Link href="/landing/astro" className="text-gray-500 hover:text-[#FF6B35] transition-colors">
                                Astrologers
                            </Link>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white font-medium truncate">
                                {astrologer.name}
                            </span>
                        </motion.nav>
                    </div>
                </section>

                {/* Hero Section - Compact */}
                <section className="pb-6 px-4 sm:px-6 lg:px-8">
                    <div className="w-full mx-auto">
                        <motion.div 
                            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-5 sm:p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex flex-col sm:flex-row gap-5">
                                {/* Avatar */}
                                <div className="flex-shrink-0 relative">
                                    {/* Badges */}
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
                                    <img
                                        src={avatar(astrologer.profileImage)}
                                        alt={astrologer.name}
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-gray-200/60 dark:ring-gray-700/60 shadow-lg"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    {/* Name & Verified */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                            {astrologer.name}
                                        </h1>
                                        {astrologer.isVerified && (
                                            <span className="verified-badge flex-shrink-0" title="Verified Astrologer"></span>
                                        )}
                                    </div>

                                    {/* Quick Stats - Compact */}
                                    <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {astrologer.avgRating ? astrologer.avgRating.toFixed(1) : 'New'}
                                            </span>
                                            <span className="text-gray-500">({astrologer.reviewsCount})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{astrologer.experienceInYears}y</span>
                                        </div>
                                        {astrologer.languageKnown && (
                                            <div className="flex items-center gap-1">
                                                <Languages className="w-3.5 h-3.5" />
                                                <span className="truncate max-w-[150px]">
                                                    {astrologer.languageKnown.split(',').slice(0, 2).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                        {astrologer.currentCity && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{astrologer.currentCity}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Skills - Compact */}
                                    {astrologer.allSkill && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {astrologer.allSkill.split(',').slice(0, 5).map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-medium rounded"
                                                >
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* CTA - Compact */}
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">From</span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{astrologer.charge}
                                                <span className="text-xs font-normal text-gray-500">/min</span>
                                            </span>
                                        </div>
                                        <motion.button
                                            onClick={() => router.push('/')}
                                            className="flex-1 sm:flex-initial px-5 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white font-semibold rounded-lg shadow-lg"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
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
                        <div className="flex gap-2 mb-6">
                            {['about', 'reviews', 'availability'].map((tab) => {
                                if (tab === 'reviews' && astrologer.reviews.length === 0) return null;
                                if (tab === 'availability' && astrologer.availabilities.length === 0) return null;
                                
                                return (
                                    <motion.button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                                            activeTab === tab
                                                ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg'
                                                : 'bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300'
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        {tab === 'reviews' && ` (${astrologer.reviewsCount})`}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'about' && (
                            <div className="space-y-4">
                                {/* Bio - Compact */}
                                {astrologer.loginBio && (
                                    <motion.div 
                                        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-5"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-[#FF6B35]" />
                                            About
                                        </h2>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {astrologer.loginBio}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Service Rates - Compact Grid */}
                                <motion.div 
                                    className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-5"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Service Rates</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {/* Chat */}
                                        <div className="p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <MessageSquare className="w-3.5 h-3.5 text-[#FF6B35]" />
                                                <span className="text-xs font-semibold text-gray-900 dark:text-white">Chat</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{astrologer.charge}<span className="text-[10px] font-normal text-gray-500">/min</span>
                                            </p>
                                        </div>

                                        {/* Call */}
                                        <div className="p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Phone className="w-3.5 h-3.5 text-[#FF6B35]" />
                                                <span className="text-xs font-semibold text-gray-900 dark:text-white">Call</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₹{astrologer.charge}<span className="text-[10px] font-normal text-gray-500">/min</span>
                                            </p>
                                        </div>

                                        {/* Video */}
                                        {astrologer.videoCallRate && (
                                            <div className="p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <Video className="w-3.5 h-3.5 text-[#FF6B35]" />
                                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">Video</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    ₹{astrologer.videoCallRate}<span className="text-[10px] font-normal text-gray-500">/min</span>
                                                </p>
                                            </div>
                                        )}

                                        {/* Report */}
                                        {astrologer.reportRate && (
                                            <div className="p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <BookOpen className="w-3.5 h-3.5 text-[#FF6B35]" />
                                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">Report</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    ₹{astrologer.reportRate}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Education - Compact */}
                                {(astrologer.highestQualification || astrologer.degree || astrologer.college || astrologer.learnAstrology) && (
                                    <motion.div 
                                        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-5"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-[#FF6B35]" />
                                            Education
                                        </h3>
                                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                            {astrologer.highestQualification && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Qualification</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">{astrologer.highestQualification}</p>
                                                </div>
                                            )}
                                            {astrologer.degree && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Degree</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">{astrologer.degree}</p>
                                                </div>
                                            )}
                                            {astrologer.college && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Institution</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">{astrologer.college}</p>
                                                </div>
                                            )}
                                            {astrologer.learnAstrology && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Training</p>
                                                    <p className="text-gray-900 dark:text-white font-medium">{astrologer.learnAstrology}</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Stats - Compact */}
                                <motion.div 
                                    className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-5"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-[#FF6B35]" />
                                        Statistics
                                    </h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                        {[
                                            { value: astrologer.stats.followerCount, label: 'Followers' },
                                            { value: astrologer.stats.reviewCount, label: 'Reviews' },
                                            { value: astrologer.stats.chatRequestCount, label: 'Chats' },
                                            { value: astrologer.stats.callRequestCount, label: 'Calls' },
                                            { value: astrologer.stats.orderCount, label: 'Orders' },
                                        ].map((stat, i) => (
                                            <div key={i} className="text-center p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                                <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* What I Do / Why I'm Here - Compact */}
                                {(astrologer.whatwillDo || astrologer.whyOnBoard) && (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {astrologer.whatwillDo && (
                                            <motion.div 
                                                className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What I Do</h4>
                                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{astrologer.whatwillDo}</p>
                                            </motion.div>
                                        )}
                                        {astrologer.whyOnBoard && (
                                            <motion.div 
                                                className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Why I'm Here</h4>
                                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{astrologer.whyOnBoard}</p>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && astrologer.reviews.length > 0 && (
                            <motion.div 
                                className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-5"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
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
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div className="flex gap-3">
                                                <img
                                                    src={avatar(review.user?.profile)}
                                                    alt={review.user?.name || 'User'}
                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                                            {review.user?.name || 'Anonymous User'}
                                                        </h4>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-semibold text-xs text-gray-900 dark:text-white">{review.rating}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                                                        {review.review}
                                                    </p>
                                                    {review.reply && (
                                                        <div className="mt-2 pl-3 border-l-2 border-[#FF6B35] bg-gray-50/80 dark:bg-gray-800/50 p-2.5 rounded-r-lg">
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                <span className="font-semibold text-[#FF6B35]">Reply:</span>
                                                            </p>
                                                            <p className="text-xs text-gray-700 dark:text-gray-300">{review.reply}</p>
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
                                        className="mt-4 w-full py-2.5 text-sm text-[#FF6B35] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {showAllReviews ? 'Show Less' : `View All ${astrologer.reviews.length} Reviews`}
                                    </motion.button>
                                )}
                            </motion.div>
                        )}

                        {/* Availability Tab */}
                        {activeTab === 'availability' && astrologer.availabilities.length > 0 && (
                            <motion.div 
                                className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-5"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#FF6B35]" />
                                    Weekly Schedule
                                </h2>
                                <div className="space-y-2">
                                    {astrologer.availabilities.map((avail, index) => (
                                        <motion.div 
                                            key={avail.id} 
                                            className="flex items-center justify-between p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg text-sm"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <span className="font-semibold text-gray-900 dark:text-white">{avail.day}</span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {avail.fromTime && avail.toTime ? `${avail.fromTime} - ${avail.toTime}` : 'Not Available'}
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
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-gray-800/50 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl font-medium text-gray-900 dark:text-white transition-all hover:scale-105"
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
                        background: #FF6B35;
                        border-radius: 20%;
                    }
                    .verified-badge:before {
                        transform: rotate(45deg);
                    }
                `}</style>
            </LandingWrapper>
        </>
    );
}