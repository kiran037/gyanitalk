import type { Metadata } from "next";
import KundaliGenerateClient from "./KundaliGenerateClient";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

const getKundaliSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "kundali",
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
  const seo = await getKundaliSEO();

  const title =
    seo?.metaTitle ??
    "Free Kundli Generation | Get Your Birth Chart Online | Gyanitalk";

  const description =
    seo?.metaDescription ??
    "Generate your free Vedic Kundli online instantly. Get detailed birth chart, planetary positions, ascendant, moon sign, and accurate astrological predictions based on your birth details.";

  const canonical =
    seo?.canonicalUrl ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/free-kundali`;

  const ogImage =
    seo?.ogImage ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/kundali-og.jpg`;

  const keywords = seo?.metaKeywords
    ? seo.metaKeywords.split(",").map((k) => k.trim())
    : [
        "free kundli",
        "birth chart",
        "horoscope",
        "vedic astrology",
        "janam kundali",
        "astrology chart",
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

export default function KundaliGeneratePage() {
  return <KundaliGenerateClient />;
}
