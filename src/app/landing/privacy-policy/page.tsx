// app/landing/privacy-policy/page.tsx
import { Metadata } from "next";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Settings,
  Mail,
  FileText,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pages_type } from "@prisma/client";

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
      image: string | null;
      url: string;
    };
    twitter: {
      title: string;
      description: string;
      image: string | null;
    };
    schema: any;
  };
  computed: {
    readTime: string;
    wordCount: number;
    lastModified: string;
  };
}

// server-side DB fetch
async function getPageData(): Promise<PageData | null> {
  try {
    const page = await prisma.pages.findFirst({
      where: {
        type: "privacy" as pages_type,
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

    const baseUrl =
      process.env.NEXT_PUBLIC_BASEURL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "";

    const plainDesc = page.description
      ? page.description.replace(/<[^>]+>/g, "")
      : "";

    const seo = {
      title: page.metaTitle || page.title || "Privacy Policy | Gyanitalk",
      metaDescription:
        page.metaDescription || (plainDesc ? plainDesc.slice(0, 160) : ""),
      metaKeywords: page.metaKeywords
        ? page.metaKeywords.split(",").map((s) => s.trim())
        : [],
      canonicalUrl: page.canonicalUrl || `/landing/privacy-policy`,
      openGraph: {
        title: page.ogTitle || page.metaTitle || page.title,
        description:
          page.ogDescription ||
          page.metaDescription ||
          (plainDesc ? plainDesc.slice(0, 200) : ""),
        image: page.ogImage || null,
        url:
          baseUrl +
          (page.slug ? `/landing/${page.slug}` : `/landing/privacy-policy`),
      },
      twitter: {
        title: page.twitterTitle || page.ogTitle || page.metaTitle || page.title,
        description:
          page.twitterDescription ||
          page.ogDescription ||
          page.metaDescription ||
          "",
        image: page.twitterImage || page.ogImage || null,
      },
      schema: page.schemaJson
        ? typeof page.schemaJson === "string"
          ? JSON.parse(page.schemaJson)
          : page.schemaJson
        : null,
    };

    const words = plainDesc
      ? plainDesc.split(/\s+/).filter(Boolean)
      : [];
    const wordCount = words.length;
    const readTimeMinutes = wordCount
      ? Math.max(1, Math.round(wordCount / 200))
      : 0;

    const computed = {
      readTime: readTimeMinutes ? `${readTimeMinutes} min read` : "—",
      wordCount,
      lastModified:
        (page.updated_at || page.created_at)?.toISOString() ||
        new Date().toISOString(),
    };

    return {
      page: {
        id: Number(page.id),
        title: page.title || "Privacy Policy",
        description: page.description || "",
        slug: page.slug || "privacy-policy",
      },
      seo,
      computed,
    } as PageData;
  } catch (err) {
    console.error("getPageData error (prisma):", err);
    return null;
  }
}

// Server-side generateMetadata using DB
export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageData();

  if (!pageData) {
    return {
      title: "Privacy Policy | Gyanitalk",
      description:
        "Learn how we protect and handle your personal information at Gyanitalk.",
    };
  }

  return {
    title: pageData.seo.title,
    description: pageData.seo.metaDescription,
    keywords: pageData.seo.metaKeywords,
    alternates: { canonical: pageData.seo.canonicalUrl },
    openGraph: {
      title: pageData.seo.openGraph.title,
      description: pageData.seo.openGraph.description,
      images: pageData.seo.openGraph.image
        ? [pageData.seo.openGraph.image]
        : undefined,
      url: pageData.seo.openGraph.url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageData.seo.twitter.title,
      description: pageData.seo.twitter.description,
      images: pageData.seo.twitter.image
        ? [pageData.seo.twitter.image]
        : undefined,
    },
    // schema is rendered as a script tag inside the page
  };
}

export default async function PrivacyPolicyPage() {
  const pageData = await getPageData();

  return (
    <LandingWrapper>
      {/* Structured Data Schema */}
      {pageData?.seo.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(pageData.seo.schema),
          }}
        />
      )}

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-black">
        {/* Animated Background - desktop only for perf */}
        <div className="pointer-events-none absolute inset-0">
          <div className="hidden md:block absolute top-16 -left-20 w-64 h-64 lg:w-80 lg:h-80 bg-[#FF6B35]/12 dark:bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="hidden md:block absolute bottom-10 -right-24 w-72 h-72 lg:w-[420px] lg:h-[420px] bg-[#FFB347]/12 dark:bg-[#FFB347]/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[#FF6B35]/10 dark:bg-white/10 border border-[#FF6B35]/20 dark:border-white/20 backdrop-blur-md text-[#FF6B35] dark:text-[#FF8C61] rounded-full text-xs sm:text-sm font-semibold mb-4 shadow-sm">
              <Shield className="w-4 h-4" />
              YOUR PRIVACY MATTERS
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Learn how we protect and handle your personal information.
            </p>
            {pageData && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-3">
                Last updated: {pageData.computed.lastModified}
              </p>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {[
              { icon: Lock, label: "256-bit Encryption" },
              { icon: Shield, label: "GDPR Compliant" },
              { icon: Eye, label: "No Data Selling" },
              { icon: UserCheck, label: "User Control" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl shadow-sm"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#FF6B35]/10 dark:bg-gradient-to-br dark:from-[#FF6B35] dark:to-[#FF8C61] rounded-lg flex items-center justify-center">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6B35] dark:text-white" />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Content from Database */}
      {pageData && pageData.page.description && (
        <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
              <div
                className="privacy-content bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 lg:p-8 shadow-sm sm:shadow-lg
                [&_p]:mb-4 [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-[1.75] [&_p]:text-gray-700 dark:[&_p]:text-gray-300
                [&_h2]:text-xl sm:[&_h2]:text-[1.5rem] [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-gray-900 dark:[&_h2]:text-white
                [&_h3]:text-lg sm:[&_h3]:text-[1.25rem] [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-gray-800 dark:[&_h3]:text-gray-100
                [&_ul]:mb-4 [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:pl-5
                [&_li]:mb-2 [&_li]:text-sm sm:[&_li]:text-base [&_li]:leading-[1.75]
                [&_ul_li]:marker:text-[#FF6B35]
                [&_strong]:text-[#FF6B35] dark:[&_strong]:text-[#FF8C61] [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: pageData.page.description }}
              />
            </article>
          </div>
        </section>
      )}

      {/* Static Fallback Content (if no database content) */}
      {(!pageData || !pageData.page.description) && (
        <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-7">
            {/* Introduction */}
            <div className="bg-gradient-to-br from-[#FF6B35]/5 to-[#FFB347]/5 dark:from-[#FF6B35]/10 dark:to-[#FFB347]/10 border border-[#FF6B35]/20 dark:border-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Introduction
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    At Gyanitalk, we take your privacy seriously. This Privacy
                    Policy explains how we collect, use, disclose, and safeguard
                    your information when you use our mobile application and
                    services.
                  </p>
                </div>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFB347] to-[#FFCC80] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Information We Collect
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    We collect information that you provide directly to us,
                    including:
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
                    {[
                      "Personal information (name, email, phone number)",
                      "Birth details for astrological consultations",
                      "Payment information for transactions",
                      "Usage data and app interactions",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#FF6B35] dark:text-[#FF8C61] mt-1">
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="bg-white/60 dark:bg:white/5 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF8C61] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    How We Use Your Information
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    We use your information to provide and improve our services,
                    process transactions, communicate with you, and ensure the
                    security of our platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Data Security
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    We implement industry-standard security measures including
                    encryption, secure servers, and regular security audits to
                    protect your personal information.
                  </p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFB347] to-[#FF6B35] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Your Privacy Rights
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    You have the right to:
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
                    {[
                      "Access your personal data",
                      "Request data correction or deletion",
                      "Opt-out of marketing communications",
                      "Data portability",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#FF6B35] dark:text-[#FF8C61] mt-1">
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 backdrop-blur-sm rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200 mb-2">
                    Important Notice
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    We will never sell, rent, or share your personal information
                    with third parties for their marketing purposes without your
                    explicit consent.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Contact Us
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    For privacy-related questions or to exercise your rights:
                  </p>
                  <a
                    href="mailto:gyanitalksapp@gmail.com"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#FF5722] hover:to-[#FF6B35] text-white text-sm sm:text-base font-semibold rounded-xl shadow-md hover:shadow-xl hover:shadow-[#FF6B35]/40 transition-all"
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
        <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="text-gray-600 dark:text-gray-400 text-center sm:text-left">
                📄 {pageData.computed.wordCount.toLocaleString()} words • ⏱️{" "}
                {pageData.computed.readTime}
              </div>
              <Link
                href="/landing/home"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/20 transition-all text-xs sm:text-sm font-medium shadow-sm"
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