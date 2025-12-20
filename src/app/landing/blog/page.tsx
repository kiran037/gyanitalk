// app/landing/blog/page.tsx
import { Metadata } from "next";
import BlogClient from "./BlogClient";

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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/landing/blog?${params}`,
    {
      next: { revalidate: 300 },
      cache: "force-cache",
    },
  );

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const data = await getBlogs(searchParams);
  const seo = data?.seo;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

    title:
      seo?.title ||
      "Astrology Blog – Insights, Horoscopes & Remedies | Gyanitalk",

    description:
      seo?.description ||
      "Read astrology blogs, daily horoscope insights, remedies and spiritual guidance.",

    keywords: [
      "astrology blog",
      "horoscope blog",
      "vedic astrology",
      "astrology remedies",
      "spiritual guidance",
      "gyanitalk blog",
    ],

    alternates: {
      canonical:
        seo?.canonical || `${process.env.NEXT_PUBLIC_SITE_URL}/landing/blog`,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: seo?.title || "Astrology Blog – Insights & Horoscopes",
      description:
        seo?.description || "Expert astrology blogs and spiritual insights.",
      url: seo?.canonical || `${process.env.NEXT_PUBLIC_SITE_URL}/landing/blog`,
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: seo?.title || "Astrology Blog – Insights & Horoscopes",
      description:
        seo?.description || "Expert astrology blogs and spiritual insights.",
    },
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
