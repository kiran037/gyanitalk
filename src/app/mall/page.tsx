// app/mall/page.tsx
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { pages_type } from "@/generated/client/client";
import { cache } from "react";
import MallClient from "@/components/landing/MallClient";

const getMallSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "mall" as pages_type,
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
      title: "AstroMall – Premium Astrology Products",
      description: "Discover premium astrology products curated by experts.",
      canonical: "/mall",
    };
  }

  return {
    title: page.metaTitle || page.title || "AstroMall – Premium Astrology Products",
    description:
      page.metaDescription ||
      "Discover premium astrology products curated by experts.",
    keywords: page.metaKeywords
      ? page.metaKeywords.split(",").map(k => k.trim())
      : [],
    canonical: page.canonicalUrl || "/mall",
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
  };
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getMallSEO();

  return {
    title: seo.title,
    description: seo.description ?? undefined,
    keywords: seo.keywords,
    alternates: {
      canonical: seo.canonical,
    },

    openGraph: seo.og?.title
      ? {
          title: seo.og.title,
          description: seo.og.description ?? undefined,
          images: seo.og.image ? [seo.og.image] : undefined,
          type: "website",
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

export default function MallPage() {
  return <MallClient />;
}