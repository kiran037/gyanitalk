// app/landing/terms-of-service/page.tsx
import { Metadata } from "next";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
    FileText, Shield, Smartphone, Wifi, AlertCircle, RefreshCw,
    Mail, CheckCircle, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma"; // add at top of file with other imports
import { pages_type } from "@prisma/client"; // optional type

interface PageData {
    page: {
        id: number;
        title: string;
        description: string;
        slug: string;
    };
    seo: {
        title: string;
        metaDescription: string;
        metaKeywords: string[];
        canonicalUrl: string;
        openGraph: {
            title: string;
            description: string;
            image: string;
            url: string;
        };
        twitter: {
            title: string;
            description: string;
            image: string;
        };
        schema: any;
    };
    computed: {
        readTime: string;
        wordCount: number;
        lastModified: string;
    };
}

async function getPageData(): Promise<PageData | null> {
    try {
        // server-side DB fetch - does not call your API route
        const page = await prisma.pages.findFirst({
            where: {
                type: "terms" as pages_type,
                isActive: true,
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                metaTitle: true,
                metaDescription: true,
                metaKeywords: true,
                canonicalUrl: true,
                ogTitle: true,
                ogDescription: true,
                ogImage: true,
                twitterTitle: true,
                twitterDescription: true,
                twitterImage: true,
                schemaJson: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!page) return null;

        const seo = {
            title: page.metaTitle || page.title || "Terms of Service | Gyanitalk",
            metaDescription: page.metaDescription || (page.description ? page.description.slice(0, 160) : ""),
            metaKeywords: page.metaKeywords ? page.metaKeywords.split(",").map(s => s.trim()) : [],
            canonicalUrl: page.canonicalUrl || `/landing/terms-of-service`,
            openGraph: {
                title: page.ogTitle || page.metaTitle || page.title,
                description: page.ogDescription || page.metaDescription || (page.description ? page.description.slice(0, 200) : ""),
                image: page.ogImage || null,
                url: (process.env.NEXT_PUBLIC_BASEURL || process.env.NEXT_PUBLIC_BASEURL || "") + (page.slug ? `/landing/${page.slug}` : `/landing/terms-of-service`)
            },
            twitter: {
                title: page.twitterTitle || page.ogTitle || page.metaTitle || page.title,
                description: page.twitterDescription || page.ogDescription || page.metaDescription || "",
                image: page.twitterImage || page.ogImage || null
            },
            schema: page.schemaJson ? (typeof page.schemaJson === "string" ? JSON.parse(page.schemaJson) : page.schemaJson) : null
        };

        const computed = {
            readTime: "—",
            wordCount: page.description ? page.description.replace(/<[^>]+>/g, "").split(/\s+/).length : 0,
            lastModified: (page.updated_at || page.created_at)?.toISOString() || new Date().toISOString()
        };

        return {
            page: {
                id: Number(page.id),
                title: page.title || "Terms & Conditions",
                description: page.description || "",
                slug: page.slug || "terms-of-service",
            },
            seo,
            computed,
        } as PageData;
    } catch (err) {
        console.error("getPageData error (prisma):", err);
        return null;
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const pageData = await getPageData();

    if (!pageData) {
        return {
            title: "Terms of Service | Gyanitalk",
            description: "Read the terms and conditions for using the Gyanitalk app.",
        };
    }

    return {
        title: pageData.seo.title,
        description: pageData.seo.metaDescription,
        keywords: pageData.seo.metaKeywords,
        alternates: {
            canonical: pageData.seo.canonicalUrl,
        },
        openGraph: {
            title: pageData.seo.openGraph.title,
            description: pageData.seo.openGraph.description,
            images: pageData.seo.openGraph.image ? [pageData.seo.openGraph.image] : undefined,
            url: pageData.seo.openGraph.url,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: pageData.seo.twitter.title,
            description: pageData.seo.twitter.description,
            images: pageData.seo.twitter.image ? [pageData.seo.twitter.image] : undefined,
        },
        other: {
            'application/ld+json': JSON.stringify(pageData.seo.schema),
        },
    };
}

export default async function TermsOfServicePage() {
    const pageData = await getPageData();

    return (
        <LandingWrapper>
            {/* Structured Data Schema */}
            {pageData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.seo.schema) }}
                />
            )}

            {/* Hero Section */}
            <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-black">
                {/* Animated Background - Enhanced for dark mode */}
                <div className="absolute top-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-[#FF6B35]/10 dark:bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-20 -right-20 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#FFB347]/10 dark:bg-[#FFB347]/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

                <div className="w-full mx-auto relative z-10">
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FF6B35]/10 dark:bg-white/10 border border-[#FF6B35]/20 dark:border-white/20 backdrop-blur-md text-[#FF6B35] dark:text-[#FF8C61] rounded-full text-sm font-semibold mb-6 shadow-lg">
                            <FileText className="w-4 h-4" />
                            LEGAL
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Terms & Conditions</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Please read these terms carefully before using the Gyanitalk app
                        </p>
                        {pageData && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                                Last updated: {pageData.computed.lastModified}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Dynamic Content from Database */}
            {pageData && pageData.page.description && (
                <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
                    <div className="w-full mx-auto">
                        <article className="prose prose-lg dark:prose-invert max-w-none">
                            <div
                                className="terms-content bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg [&_p]:mb-6 [&_p]:text-base [&_p]:leading-[1.8] [&_p]:text-gray-700 dark:[&_p]:text-gray-300 [&_h2]:text-[1.75rem] [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-5 [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h3]:text-[1.375rem] [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-gray-800 dark:[&_h3]:text-gray-100 [&_ul]:mb-6 [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:pl-6 [&_li]:mb-3 [&_li]:text-base [&_li]:leading-[1.8] [&_ul_li]:marker:text-[#FF6B35] [&_strong]:text-[#FF6B35] dark:[&_strong]:text-[#FF8C61] [&_strong]:font-semibold"
                                dangerouslySetInnerHTML={{ __html: pageData.page.description }}
                            />
                        </article>
                    </div>
                </section>
            )}

            {/* Static Fallback Content (if no database content) */}
            {(!pageData || !pageData.page.description) && (
                <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
                    <div className="w-full mx-auto space-y-6">
                        {/* Introduction */}
                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Introduction</h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                                        By downloading or using the app, these terms will automatically apply to you – you should make sure therefore that you read them carefully before using the app. You're not allowed to copy, or modify the app, any part of the app, or our trademarks in any way.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-[#FF6B35]/10 dark:bg-[#FF6B35]/20 border border-[#FF6B35]/20 dark:border-[#FF6B35]/30 backdrop-blur-sm rounded-xl">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>Important:</strong> By agreeing to these terms, you are also accepting the Privacy Policy of this app.
                                </p>
                            </div>
                        </div>

                        {/* App Usage & Services */}
                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#FFB347] to-[#FFCC80] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Smartphone className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">App Usage & Services</h2>
                                    <div className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                                        <p>
                                            Gyanitalk is committed to ensuring that the app is as useful and efficient as possible. We reserve the right to make changes to the app or to charge for its services, at any time and for any reason.
                                        </p>
                                        <p>
                                            The Gyanitalk app stores and processes personal data that you have provided to us. It's your responsibility to keep your phone and access to the app secure.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Third Party Services */}
                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Third Party Services</h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 text-sm sm:text-base">
                                        The app uses third party services that declare their own Terms and Conditions:
                                    </p>
                                    <div className="space-y-2">
                                        {[
                                            "Google Play Services",
                                            "Google Analytics for Firebase",
                                            "Facebook"
                                        ].map((service, i) => (
                                            <div key={i} className="flex items-center gap-2 p-3 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-lg">
                                                <CheckCircle className="w-4 h-4 text-[#FF6B35] dark:text-[#FF8C61] flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">{service}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Internet Connection */}
                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#FF8C61] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Wifi className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Internet Connection</h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                                        The app requires an active internet connection. Gyanitalk cannot take responsibility for the app not working at full functionality if you don't have access to Wi-Fi or mobile data.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Updates & Termination */}
                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#FFB347] to-[#FF6B35] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <RefreshCw className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Updates & Termination</h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                                        We may update the app from time to time. You'll need to download updates if you want to keep using the app. We may also terminate use of the app at any time without notice.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Changes to Terms */}
                        <div className="bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 dark:from-[#FF6B35]/20 dark:to-[#FFB347]/20 border border-[#FF6B35]/20 dark:border-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Changes to Terms</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                                We may update our Terms and Conditions from time to time. You are advised to review this page periodically for any changes.
                            </p>
                        </div>

                        {/* Contact Section */}
                        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Contact Us</h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 text-sm sm:text-base">
                                        If you have any questions about our Terms and Conditions:
                                    </p>
                                    <a
                                        href="mailto:gyanitalksapp@gmail.com"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#FF5722] hover:to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-[#FF6B35]/50 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                                    >
                                        <Mail className="w-4 h-4" />
                                        gyanitalksapp@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Reading Info & Back Button */}
            {pageData && (
                <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-white/10">
                    <div className="w-full mx-auto">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                📄 {pageData.computed.wordCount.toLocaleString()} words •
                                ⏱️ {pageData.computed.readTime}
                            </div>
                            <Link
                                href="/landing/home"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/20 transition-all text-sm font-medium shadow-lg"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </LandingWrapper>
    );
}