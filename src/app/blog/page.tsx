// app/blog/page.tsx
import { Metadata } from "next";
import BlogClient from "./BlogClient";
import { prisma } from "@/lib/prisma";
import { pages_type } from "@/generated/client/client";
import { cache } from "react";
import { headers } from "next/headers";

const getBlogSEO = cache(async () => {
  const page = await prisma.pages.findFirst({
    where: {
      type: "blogs" as pages_type,
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
      title: "Astrology Blog – Insights, Horoscopes & Remedies | Gyanitalk",
      description: "Read astrology blogs, daily horoscope insights, remedies and spiritual guidance.",
      keywords: [
        "astrology blog",
        "horoscope blog",
        "vedic astrology",
        "astrology remedies",
        "spiritual guidance",
        "gyanitalk blog",
      ],
      canonical: "/blog",
    };
  }

  return {
    title: page.metaTitle || page.title || "Astrology Blog – Insights, Horoscopes & Remedies | Gyanitalk",
    description:
      page.metaDescription ||
      "Read astrology blogs, daily horoscope insights, remedies and spiritual guidance.",
    keywords: page.metaKeywords
      ? page.metaKeywords.split(",").map(k => k.trim())
      : [],
    canonical: page.canonicalUrl || "/blog",
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



async function getBlogs(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
) {
  const sp = await searchParams;

  const params = new URLSearchParams({
    page: typeof sp.page === "string" ? sp.page : "1",
    limit: "9",
    sortBy: typeof sp.sortBy === "string" ? sp.sortBy : "latest",
  });

  if (typeof sp.search === "string") {
    params.append("search", sp.search);
  }

  if (typeof sp.categoryId === "string") {
    params.append("categoryId", sp.categoryId);
  }

  const h = await headers();
const host = h.get("host");
  const protocol =
    process.env.NODE_ENV === "production" ? "https" : "http";

  const url = `${protocol}://${host}/api/landing/blog?${params}`;

  const res = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const seo = await getBlogSEO();

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

    other: {
      "content-language": "en",
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await getBlogs(searchParams);

  // 🔒 Hard fallback (no blank page ever)
  const safeData =
    data?.success && data.data
      ? data
      : {
          data: [],
          categories: [],
          popularBlogs: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };

  return <BlogClient initialData={safeData} />;
}