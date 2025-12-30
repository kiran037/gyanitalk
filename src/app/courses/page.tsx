///Users/xeoren/Desktop/gyanitallk-admin/src/app/landing/courses/page.tsx
import type { Metadata } from "next";
import CoursesClient from "./CoursesClient";
import { prisma } from "@/lib/prisma";

/* ================= SEO (SERVER ONLY) ================= */

async function getCoursesPageSeo() {
  return prisma.pages.findFirst({
    where: {
      type: "courses",
      isActive: true,
    },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCoursesPageSeo();

  const title =
    seo?.metaTitle ??
    "Astrology Courses | Learn Vedic Astrology Online | Gyanitalk";

  const description =
    seo?.metaDescription ??
    "Explore beginner to advanced astrology courses. Learn Vedic astrology, horoscope reading, and predictive techniques from expert astrologers at Gyanitalk.";

  const canonical =
    seo?.canonicalUrl ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/courses`;

  const ogImage =
    seo?.ogImage ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/default-og.jpg`;

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

/* ================= PAGE ================= */

export default function CoursesPage() {
  return <CoursesClient />;
}