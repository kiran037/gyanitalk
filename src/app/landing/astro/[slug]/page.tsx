import { Metadata } from "next";
import { notFound } from "next/navigation";
import AstrologerDetailClient from "./AstrologerDetailClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Fetch astrologer data on server
async function getAstrologer(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/landing/astro/${slug}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Failed to fetch astrologer:", error);
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const astrologer = await getAstrologer(slug);

  if (!astrologer || !astrologer.seo) {
    return {
      title: "Astrologer Not Found",
      description: "The astrologer you're looking for doesn't exist.",
    };
  }

  const seo = astrologer.seo;
  const skills = astrologer.allSkill
    ? astrologer.allSkill
        .split(",")
        .map((s: string) => s.trim())
        .slice(0, 6)
    : [];

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),

    title: skills.length
      ? `${seo.metaTitle} | ${skills.join(", ")}`
      : seo.metaTitle,
    description: skills.length
      ? `${seo.metaDescription} Specializes in ${skills.join(", ")}.`
      : seo.metaDescription,
    keywords: [seo.metaKeywords, skills.join(", "), astrologer.name]
      .filter(Boolean)
      .join(", "),
    alternates: {
      canonical: seo.canonicalUrl,
    },
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: seo.ogTitle,
        },
      ],
      url: seo.ogUrl,
      type: seo.ogType as any,
    },
    twitter: {
      card: seo.twitterCard as any,
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      images: [seo.twitterImage],
    },
  };
}

// Generate static params for static generation (optional)
export async function generateStaticParams() {
  // You can fetch a list of astrologer slugs here for static generation
  // For now, we'll use dynamic rendering
  return [];
}

export default async function AstrologerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const astrologer = await getAstrologer(slug);
  const skills = astrologer.allSkill
    ? astrologer.allSkill
        .split(",")
        .map((s: string) => s.trim())
        .slice(0, 6)
    : [];

  if (!astrologer) {
    notFound();
  }

  const structuredData = astrologer.seo?.schemaJson
    ? {
        ...JSON.parse(astrologer.seo.schemaJson),
        knowsAbout: skills,
      }
    : {
        "@context": "https://schema.org",
        "@type": "Person",
        name: astrologer.name,
        knowsAbout: skills,
      };

  const breadcrumbData = astrologer.seo?.breadcrumbSchema
    ? JSON.parse(astrologer.seo.breadcrumbSchema)
    : null;

  return (
    <>
      {/* ✅ SEO-critical H1 */}
      <h1 className="sr-only">{astrologer.name}</h1>
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
      )}

      {/* Client Component */}
      <AstrologerDetailClient astrologer={astrologer} />
    </>
  );
}
