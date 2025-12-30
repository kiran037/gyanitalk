// app/landing/courses/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";

/* ================= DATA FETCH ================= */

async function getCourse(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/landing/courses/${slug}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) return null;
  return res.json();
}

/* ================= SEO (META TAGS) ================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const res = await getCourse(slug);
  const seo = res?.data?.seo;
  const course = res?.data?.course;

  if (!course) {
    return {
      title: "Course Not Found | Gyanitalk",
      robots: { index: false, follow: false },
    };
  }

  const title =
    seo?.metaTitle ?? `${course.name} | Astrology Course | Gyanitalk`;

  const description =
    seo?.metaDescription ??
    course.description?.replace(/<[^>]*>/g, "").slice(0, 155) ??
    "Learn astrology with expert-led courses on Gyanitalk.";

  const canonical =
    seo?.canonicalUrl ??
    `${process.env.NEXT_PUBLIC_SITE_URL}/courses/${course.slug}`;

  const ogImage =
    seo?.ogImage ??
    course.image ??
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
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
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

/* ================= PAGE (+ JSON-LD SCHEMA) ================= */

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const res = await getCourse(slug);
  const course = res?.data?.course;

  if (!course) {
    notFound();
  }

  /* ---------- JSON-LD SCHEMA (COURSE + BREADCRUMB) ---------- */

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description:
      course.description?.replace(/<[^>]*>/g, "") ??
      "Astrology course on Gyanitalk",
    provider: {
      "@type": "Organization",
      name: "Gyanitalk",
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    educationalCredentialAwarded: course.isPaid ? "Certificate" : undefined,
    offers: {
      "@type": "Offer",
      price: course.offerPrice ?? course.price ?? 0,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/courses/${course.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Courses",
        item: `${process.env.NEXT_PUBLIC_SITE_URL}/courses`,
      },
      ...(course.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: course.category.name,
              item: `${process.env.NEXT_PUBLIC_SITE_URL}/courses`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: 3,
        name: course.name,
        item: `${process.env.NEXT_PUBLIC_SITE_URL}/courses/${course.slug}`,
      },
    ],
  };

  return (
    <>
      {/* ✅ JSON-LD for Lighthouse & Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(courseSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <CourseDetailClient
        course={course}
        relatedCourses={res.data.relatedCourses}
      />
    </>
  );
}