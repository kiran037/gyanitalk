import type { Metadata } from "next";
import HoroscopeClient from "./HoroscopeClient";
import { prisma } from "@/lib/prisma";
import { cache, Suspense } from "react";

const getHoroscopeSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "horoscope",
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

  return page;
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getHoroscopeSEO();

  const title =
    seo?.metaTitle ??
    "Daily Horoscope | Free Astrology Predictions | Gyanitalk";

  const description =
    seo?.metaDescription ??
    "Get your free daily, weekly, and yearly horoscope readings. Discover what the stars have in store for your zodiac sign with accurate astrology predictions.";

  const canonical =
    seo?.canonicalUrl ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/horoscope`;

  const ogImage =
    seo?.ogImage ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/horoscope-og.jpg`;

  const keywords = seo?.metaKeywords
    ? seo.metaKeywords.split(",").map((k) => k.trim())
    : [
        "daily horoscope",
        "zodiac predictions",
        "astrology",
        "horoscope today",
        "free horoscope",
        "weekly horoscope",
        "yearly horoscope",
      ];

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

    title,
    description,
    keywords,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      url: canonical,
      siteName: "Gyanitalk",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle ?? title,
      description: seo?.twitterDescription ?? description,
      images: [seo?.twitterImage ?? ogImage],
    },
  };
}

export default function HoroscopePage() {
  return (
    <>
      <h1 className="sr-only">Daily Horoscope - Your Zodiac Predictions</h1>

      <Suspense fallback={null}>
        <HoroscopeClient />
      </Suspense>
    </>
  );
}
