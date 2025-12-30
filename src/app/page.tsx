

import type { Metadata } from "next";
import HomeClient from "@/components/landing/HomeClient";
import { prisma } from "@/lib/prisma";
import { cache } from "react";

const getHomeSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "home",
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
  const seo = await getHomeSEO();

  const title =
    seo?.metaTitle ??
    "Gyanitalk – Talk to Astrologers Online | Horoscope & Kundli";

  const description =
    seo?.metaDescription ??
    "Talk to verified astrologers online. Get horoscope, kundli, astrology guidance & spiritual insights on Gyanitalk.";

  const canonical =
    seo?.canonicalUrl ?? process.env.NEXT_PUBLIC_SITE_URL!;

  const ogImage =
    seo?.ogImage ?? `${process.env.NEXT_PUBLIC_SITE_URL}/og-default.jpg`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

    title,
    description,

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

export default function HomePage() {
  return <HomeClient />;
}