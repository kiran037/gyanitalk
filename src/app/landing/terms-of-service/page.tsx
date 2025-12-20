// app/landing/terms-of-service/page.tsx
import { Metadata } from "next";
import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  FileText,
  Shield,
  Smartphone,
  Wifi,
  AlertCircle,
  RefreshCw,
  Mail,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pages_type } from "@prisma/client";
import { cache } from "react";

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

const getPageData = cache(async (): Promise<PageData | null> => {
  try {
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

    const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "";

    const seo = {
      title: page.metaTitle || page.title || "Terms of Service | Gyanitalk",
      metaDescription:
        page.metaDescription ||
        (page.description ? page.description.slice(0, 160) : ""),
      metaKeywords: page.metaKeywords
        ? page.metaKeywords.split(",").map((s) => s.trim())
        : [],
      canonicalUrl: page.canonicalUrl || `/landing/terms-of-service`,
      openGraph: {
        title: page.ogTitle || page.metaTitle || page.title,
        description:
          page.ogDescription ||
          page.metaDescription ||
          (page.description ? page.description.slice(0, 200) : ""),
        image: page.ogImage || null,
        url:
          baseUrl +
          (page.slug ? `/landing/${page.slug}` : `/landing/terms-of-service`),
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

    const textOnly = page.description
      ? page.description.replace(/<[^>]+>/g, "")
      : "";
    const words = textOnly ? textOnly.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const readTimeMinutes = wordCount ? Math.max(1, Math.round(wordCount / 200)) : 0;

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
});

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
    robots: {
      index: true,
      follow: true,
    },
    keywords: pageData.seo.metaKeywords,
    alternates: {
      canonical: pageData.seo.canonicalUrl,
    },
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
    // If you want schema as a separate script tag, you already render it in the page
  };
}

export default async function TermsOfServicePage() {
  const pageData = await getPageData();

  return (
    <LandingWrapper>
      {/* Structured Data Schema (only if present) */}
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
        {/* Animated Background – desktop only to save mobile perf */}
        <div className="pointer-events-none absolute inset-0">
          <div className="hidden md:block absolute top-16 -left-20 w-64 h-64 lg:w-80 lg:h-80 bg-[#FF6B35]/12 dark:bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="hidden md:block absolute bottom-10 -right-24 w-72 h-72 lg:w-[420px] lg:h-[420px] bg-[#FFB347]/12 dark:bg-[#FFB347]/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[#FF6B35]/10 dark:bg-white/10 border border-[#FF6B35]/20 dark:border-white/20 backdrop-blur-md text-[#FF6B35] dark:text-[#FF8C61] rounded-full text-xs sm:text-sm font-semibold mb-4 shadow-sm">
              <FileText className="w-4 h-4" aria-hidden="true" />
              LEGAL
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Terms &amp; Conditions
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully before using the Gyanitalk app.
            </p>
            {pageData && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-3">
                Last updated: {new Date(pageData.computed.lastModified).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Content from Database */}
      {pageData && pageData.page.description && (
        <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
          <div className="max-w-4xl mx-auto">
            <article className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
              <div
                className="terms-content bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 lg:p-8 shadow-sm sm:shadow-lg
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
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Introduction
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    By downloading or using the app, these terms will
                    automatically apply to you – you should make sure therefore
                    that you read them carefully before using the app. You&apos;re
                    not allowed to copy, or modify the app, any part of the app,
                    or our trademarks in any way.
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-[#FF6B35]/10 dark:bg-[#FF6B35]/20 border border-[#FF6B35]/20 dark:border-[#FF6B35]/30 backdrop-blur-sm rounded-xl">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  <strong>Important:</strong> By agreeing to these terms, you
                  are also accepting the Privacy Policy of this app.
                </p>
              </div>
            </div>

            {/* App Usage & Services */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFB347] to-[#FFCC80] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    App Usage &amp; Services
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    Gyanitalk is committed to ensuring that the app is as useful
                    and efficient as possible. We reserve the right to make
                    changes to the app or to charge for its services, at any
                    time and for any reason.
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    The Gyanitalk app stores and processes personal data that
                    you have provided to us. It&apos;s your responsibility to keep
                    your phone and access to the app secure.
                  </p>
                </div>
              </div>
            </div>

            {/* Third Party Services */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Third Party Services
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    The app uses third party services that declare their own
                    Terms and Conditions:
                  </p>
                  <div className="space-y-2">
                    {["Google Play Services", "Google Analytics for Firebase", "Facebook"].map(
                      (service, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2.5 sm:p-3 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 text-[#FF6B35] dark:text-[#FF8C61] flex-shrink-0" aria-hidden="true" />
                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            {service}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Internet Connection */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF8C61] to-[#FFB347] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Internet Connection
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    The app requires an active internet connection. Gyanitalk
                    cannot take responsibility for the app not working at full
                    functionality if you don&apos;t have access to Wi-Fi or mobile
                    data.
                  </p>
                </div>
              </div>
            </div>

            {/* Updates & Termination */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFB347] to-[#FF6B35] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Updates &amp; Termination
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    We may update the app from time to time. You&apos;ll need to
                    download updates if you want to keep using the app. We may
                    also terminate use of the app at any time without notice.
                  </p>
                </div>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 dark:from-[#FF6B35]/20 dark:to-[#FFB347]/20 border border-[#FF6B35]/20 dark:border-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Changes to Terms
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update our Terms and Conditions from time to time. You
                are advised to review this page periodically for any changes.
              </p>
            </div>

            {/* Contact Section */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 sm:p-7 shadow-sm sm:shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Contact Us
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    If you have any questions about our Terms and Conditions:
                  </p>
                  <a
                    href="mailto:gyanitalksapp@gmail.com"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] hover:from-[#FF5722] hover:to-[#FF6B35] text-white text-sm sm:text-base font-semibold rounded-xl shadow-md hover:shadow-xl hover:shadow-[#FF6B35]/40 transition-all"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
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
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      )}
    </LandingWrapper>
  );
}