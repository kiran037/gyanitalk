import { Metadata } from "next";
import { notFound } from "next/navigation";
import AstrologerDetailClient from "./AstrologerDetailClient";

/* ================= TYPES ================= */

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string | null;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  schemaJson?: string;
  breadcrumbSchema?: string;
}

interface SocialLinks {
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  youtube: string | null;
  website: string | null;
}

interface Review {
  id: string;
  rating: number;
  review: string;
  reply: string | null;
  isPublic: boolean | null;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    profile: string | null;
  } | null;
}

interface Availability {
  id: string;
  day: string;
  fromTime: string | null;
  toTime: string | null;
}

interface Assistant {
  id: string;
  name: string;
  email: string | null;
  contactNo: string;
  gender: string;
  primarySkill: string | null;
  allSkill: string | null;
  languageKnown: string | null;
  experienceInYears: number;
  profile: string | null;
}

interface Stats {
  followerCount: number;
  reviewCount: number;
  chatRequestCount: number;
  callRequestCount: number;
  orderCount: number;
}

// Strictly matches the API Payload
export interface Astrologer {
  id: string;
  userId: string;
  name: string;
  slug: string;
  email: string;
  contactNo: string;
  gender: string;
  birthDate: string;
  profileImage: string | null;
  primarySkill: string | null;
  allSkill: string | null;
  languageKnown: string | null;
  charge: number;
  experienceInYears: number;
  dailyContribution: number;
  currentCity: string | null;
  highestQualification: string | null;
  degree: string | null;
  college: string | null;
  learnAstrology: string | null;
  isVerified: boolean;
  isLiveOff: number;
  monthlyEarning: string | null;
  whatwillDo: string | null;
  whyOnBoard: string | null;
  top_badge: string | null;
  featured_badge: string | null;
  chatStatus: string | null;
  chatWaitTime: string | null;
  callStatus: string | null;
  callWaitTime: string | null;
  videoCallRate: number | null;
  reportRate: number | null;
  loginBio: string | null;
  created_at: string;
  updated_at: string;
  
  // Nested Objects
  seo: SeoData;
  socialLinks: SocialLinks;
  assistants: Assistant[];
  availabilities: Availability[];
  reviews: Review[];
  
  // Loosely typed arrays for now, or define specific interfaces if used in UI
  stories: any[]; 
  gifts: any[];
  commissions: any[];

  avgRating: number | null;
  reviewsCount: number;
  stats: Stats;
  
  user: {
    id: string;
    name: string | null;
    email: string | null;
    profile: string | null;
  } | null;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://app.gyanitalk.com";

/* ================= DATA FETCHING ================= */

async function getAstrologer(slug: string): Promise<Astrologer | null> {
  try {
    const res = await fetch(`${SITE_URL}/api/landing/astro/${slug}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.success ? (data.data as Astrologer) : null;
  } catch (error) {
    console.error("Failed to fetch astrologer:", error);
    return null;
  }
}

/* ================= METADATA ================= */

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

  // Safe skill parsing (API now returns proper names)
  const skills = astrologer.allSkill
    ? astrologer.allSkill
        .split(",")
        .map((s) => s.trim())
        .slice(0, 6)
    : [];

  const existingKeywords = seo.metaKeywords
    ? seo.metaKeywords.split(",").map((k) => k.trim())
    : [];

  const finalKeywords = Array.from(new Set([
    ...existingKeywords,
    ...skills,
    astrologer.name,
  ]));

  const pageTitle = seo.metaTitle || `${astrologer.name} - Astrologer`;

  return {
    metadataBase: new URL(SITE_URL),
    title: pageTitle,
    description: seo.metaDescription,
    keywords: finalKeywords,
    
    openGraph: {
      title: seo.ogTitle || pageTitle,
      description: seo.ogDescription || seo.metaDescription,
      images: [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: seo.ogTitle || pageTitle,
        },
      ],
      url: seo.ogUrl,
      type: (seo.ogType as any) || "profile",
    },
    twitter: {
      card: (seo.twitterCard as any) || "summary_large_image",
      title: seo.twitterTitle || pageTitle,
      description: seo.twitterDescription || seo.metaDescription,
      images: [seo.twitterImage || seo.ogImage],
    },
  };
}

export async function generateStaticParams() {
  return [];
}

/* ================= PAGE COMPONENT ================= */

export default async function AstrologerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const astrologer = await getAstrologer(slug);

  if (!astrologer) {
    notFound();
  }

  // Parse JSON strings explicitly for Schema injection
  let structuredData = null;
  let breadcrumbData = null;

  try {
    if (astrologer.seo?.schemaJson) {
      structuredData = JSON.parse(astrologer.seo.schemaJson);
    }
    if (astrologer.seo?.breadcrumbSchema) {
      breadcrumbData = JSON.parse(astrologer.seo.breadcrumbSchema);
    }
  } catch (e) {
    console.error("Error parsing schema JSON:", e);
  }

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

      {/* Client Component with strict typing */}
      <AstrologerDetailClient astrologer={astrologer} />
    </>
  );
}