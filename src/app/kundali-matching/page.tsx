import type { Metadata } from "next";
import KundaliMatchClient from "./KundaliMatchClient";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

const getKundaliMatchingSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "kundali_matching",
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
  const seo = await getKundaliMatchingSEO();

  const title =
    seo?.metaTitle ??
    "Free Kundli Matching | Gun Milan | Horoscope Compatibility | Gyanitalk";

  const description =
    seo?.metaDescription ??
    "Check Kundli matching for marriage online. Get detailed compatibility analysis with Ashtakoot scoring, Guna Milan, Manglik Dosha check, and remedies - 100% free.";

  const canonical =
    seo?.canonicalUrl ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/kundali-matching`;

  const ogImage =
    seo?.ogImage ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/kundali-matching-og.jpg`;

  const keywords = seo?.metaKeywords
    ? seo.metaKeywords.split(",").map((k) => k.trim())
    : [
        "kundli matching",
        "gun milan",
        "horoscope matching",
        "marriage compatibility",
        "ashtakoot",
        "guna milan",
        "manglik dosha",
        "kundali milan",
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

export default function KundaliMatchPage() {
  return <KundaliMatchClient />;
}