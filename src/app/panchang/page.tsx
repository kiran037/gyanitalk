// app/panchang/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import PanchangClient from "./PanchangClient";
import { prisma } from "@/lib/prisma";
import { pages_type } from "@/generated/client/client";
import { cache } from "react";

/* ================= SEO (SERVER ONLY) ================= */

const getPanchangSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "panchang" as pages_type,
      isActive: true,
    },
    select: {
      title: true,
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
    },
  });

  // 🔁 fallback if admin has not set SEO
  if (!page) {
    return {
      title: "Daily Panchang | Hindu Calendar & Auspicious Timings | Gyanitalk",
      description: "Get accurate daily Panchang with Tithi, Nakshatra, Yoga, Karana, and auspicious timings. Plan your important events according to Vedic astrology.",
      keywords: [
        "panchang",
        "daily panchang",
        "hindu calendar",
        "tithi",
        "nakshatra",
        "yoga",
        "karana",
        "auspicious timings",
        "muhurat",
        "vedic calendar",
        "hindu panchang",
        "today panchang",
        "panchangam",
        "rahukaal",
        "gulika kalam",
        "abhijit muhurat",
      ],
      canonical: "/panchang",
    };
  }

  return {
    title: page.metaTitle || page.title || "Daily Panchang | Hindu Calendar & Auspicious Timings | Gyanitalk",
    description:
      page.metaDescription ||
      "Get accurate daily Panchang with Tithi, Nakshatra, Yoga, Karana, and auspicious timings. Plan your important events according to Vedic astrology.",
    keywords: page.metaKeywords
      ? page.metaKeywords.split(",").map(k => k.trim())
      : [],
    canonical: page.canonicalUrl || "/panchang",
    og: {
      title: page.ogTitle,
      description: page.ogDescription,
      image: page.ogImage,
    },
    twitter: {
      title: page.twitterTitle,
      description: page.twitterDescription,
      image: page.twitterImage,
    },
    schemaJson: page.schemaJson,
  };
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPanchangSEO();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

    title: seo.title,
    description: seo.description ?? undefined,
    keywords: seo.keywords,

    alternates: {
      canonical: seo.canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: seo.og?.title
      ? {
          title: seo.og.title,
          description: seo.og.description ?? undefined,
          url: seo.canonical,
          siteName: "Gyanitalk",
          type: "website",
          images: seo.og.image ? [seo.og.image] : undefined,
        }
      : undefined,

    twitter: seo.twitter?.title
      ? {
          card: "summary_large_image",
          title: seo.twitter.title,
          description: seo.twitter.description ?? undefined,
          images: seo.twitter.image ? [seo.twitter.image] : undefined,
        }
      : undefined,
  };
}

/* ================= PAGE ================= */

export default function PanchangPage() {
  return (
    <>
      <h1 className="sr-only">
        Daily Panchang - Hindu Calendar & Auspicious Timings
      </h1>

      <Suspense fallback={null}>
        <PanchangClient />
      </Suspense>
    </>
  );
}