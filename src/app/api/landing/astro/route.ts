// src/app/api/landing/astro/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") ?? 12)));
    const search = url.searchParams.get("search")?.trim() ?? "";

    const skip = (page - 1) * limit;

// ✅ Build WHERE clause with MySQL-compatible search (NULL-safe)
const where: any = { isActive: true, isDelete: false };
if (search) {
  where.OR = [
    { name: { contains: search } },
    { slug: { not: null, contains: search } },
    { metaKeywords: { not: null, contains: search } },
    { loginBio: { not: null, contains: search } },
  ];
}

    const matching = await prisma.astrologers.findMany({
      where,
      select: { id: true, top_badge: true },
    });

    const allIds: bigint[] = matching.map(m => m.id);

    if (allIds.length === 0) {
      return NextResponse.json({
        page,
        limit,
        total: 0,
        totalPages: 0,
        data: [],
        seo: {
          title: "Find Top Verified Astrologers Online | Expert Astrology Consultation",
          description: "Connect with verified astrologers for personalized guidance. Get instant consultations via chat, call, or video.",
          keywords: "astrologers, online astrology, best astrologers, verified astrologers"
        }
      });
    }

    // Split into topBadgeIds and otherIds
    const topBadgeIds = matching
      .filter(m => !!(m.top_badge && String(m.top_badge).trim() !== ""))
      .map(m => m.id);
    const otherIds = matching
      .filter(m => !(m.top_badge && String(m.top_badge).trim() !== ""))
      .map(m => m.id);

    // -------------------------
    // Step 2: Get review stats for all IDs
    // -------------------------
    const reviewAgg = await prisma.user_reviews.groupBy({
      by: ["astrologerId"],
      where: {
        astrologerId: { in: allIds },
        isActive: true,
        isDelete: false
      },
      _count: { _all: true },
      _avg: { rating: true }
    });

    const reviewMap = new Map<string, { count: number; avg: number | null }>();
    reviewAgg.forEach(r => {
      if (r.astrologerId === null) return;
      reviewMap.set(r.astrologerId.toString(), {
        count: r._count?._all ?? 0,
        avg: r._avg?.rating ?? null
      });
    });

    const getReviewCount = (id: bigint) => {
      const v = reviewMap.get(id.toString());
      return v ? v.count : 0;
    };

    // -------------------------
    // Step 3: Sort by review count (TOP badge first, then others)
    // -------------------------
    const sortIdsByReviewsDesc = (ids: bigint[]) => {
      return ids.slice().sort((a, b) => {
        const ra = getReviewCount(a);
        const rb = getReviewCount(b);
        if (ra !== rb) return rb - ra;
        return Number(b.toString()) - Number(a.toString());
      });
    };

    const sortedTop = sortIdsByReviewsDesc(topBadgeIds);
    const sortedOther = sortIdsByReviewsDesc(otherIds);
    const orderedIds = [...sortedTop, ...sortedOther];
    const total = orderedIds.length;

    // -------------------------
    // Step 4: Paginate
    // -------------------------
    const pageIds = orderedIds.slice(skip, skip + limit);

    if (pageIds.length === 0) {
      return NextResponse.json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: [],
      });
    }

    // -------------------------
    // Step 5: Fetch astrologer data WITH SEO fields
    // -------------------------
    const rows = await prisma.astrologers.findMany({
      where: { id: { in: pageIds } },
      select: {
        id: true,
        name: true,
        slug: true,
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
        profileImage: true,
        primarySkill: true,
        allSkill: true,
        charge: true,
        experienceInYears: true,
        languageKnown: true,
        country: true,
        isVerified: true,
        monthlyEarning: true,
        top_badge: true,
        chatStatus: true,
        chatWaitTime: true,
        callStatus: true,
        callWaitTime: true,
        videoCallRate: true,
        loginBio: true,
        _count: {
          select: {
            followers: true,
            reviews: true
          },
        },
      },
    });

    // Map rows by ID for ordering
    const rowById = new Map<string, any>();
    rows.forEach(r => rowById.set(r.id.toString(), r));

    // -------------------------
    // Step 6: Fetch skill & language mappings
    // -------------------------
    const allSkills = await prisma.skills.findMany({
      where: { isActive: true, isDelete: false },
      select: { id: true, name: true }
    });
    const skillMap = new Map(allSkills.map(s => [s.id.toString(), s.name]));

    const allLanguages = await prisma.languages.findMany({
      select: { id: true, languageName: true }
    });
    const languageMap = new Map(allLanguages.map(l => [l.id.toString(), l.languageName]));

   const results = pageIds.map((idBig) => {
  const r = rowById.get(idBig.toString());
  if (!r) return null;

  // ✅ Generate slug if missing
  const astrologerSlug = r.slug || r.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const languageNames = r.languageKnown
    ? r.languageKnown.split(',')
      .map((id: string) => languageMap.get(id.trim()) || id.trim())
      .filter(Boolean)
      .join(', ')
    : null;

  const primarySkillName = r.primarySkill
    ? skillMap.get(r.primarySkill) || r.primarySkill
    : null;

  const allSkillNames = r.allSkill
    ? r.allSkill.split(',')
      .slice(0, 3)
      .map((id: string) => skillMap.get(id.trim()) || id.trim())
      .join(', ')
    : null;

  const agg = reviewMap.get(r.id.toString());
  const avgRating = agg?.avg ?? null;
  const reviewCount = agg?.count ?? (r._count?.reviews ?? 0);

  return {
    id: r.id.toString(),
    name: r.name,
    slug: astrologerSlug, // ✅ Use generated slug
    profileImage: r.profileImage,
    primarySkill: primarySkillName,
    allSkill: allSkillNames,
    charge: r.charge,
    experienceInYears: r.experienceInYears,
    languageKnown: languageNames,
    country: r.country,
    isVerified: r.isVerified,
    monthlyEarning: r.monthlyEarning,
    chatStatus: r.chatStatus,
    chatWaitTime: r.chatWaitTime,
    callStatus: r.callStatus,
    callWaitTime: r.callWaitTime,
    videoCallRate: r.videoCallRate,
    followerCount: r._count?.followers ?? 0,
    reviewCount,
    avgRating: avgRating ? Number(avgRating.toFixed(1)) : null,
    loginBio: r.loginBio, 
    badges: {
      top_badge: r.top_badge,
    },
    seo: {
      metaTitle: r.metaTitle || `${r.name} - Expert Astrologer | ${primarySkillName || 'Astrology'}`,
      metaDescription: r.metaDescription || `Consult with ${r.name}, experienced astrologer with ${r.experienceInYears}+ years. Get expert guidance on ${primarySkillName}. ₹${r.charge}/min`,
      metaKeywords: r.metaKeywords || `${r.name}, astrologer, ${primarySkillName}, online consultation`,
      canonicalUrl: r.canonicalUrl || `/landing/astro/${astrologerSlug}`, // ✅ Use slug in canonical
      ogTitle: r.ogTitle || r.metaTitle || r.name,
      ogDescription: r.ogDescription || r.metaDescription,
      ogImage: r.ogImage || r.profileImage,
      twitterTitle: r.twitterTitle || r.metaTitle || r.name,
      twitterDescription: r.twitterDescription || r.metaDescription,
      twitterImage: r.twitterImage || r.profileImage,
      schemaJson: r.schemaJson,
    }
  };
}).filter(Boolean);

    const safeResults = results.filter((r): r is NonNullable<typeof r> => r != null);

    const pageSEO = {
      title: search
        ? `${search} - Find Astrologers | Page ${page}`
        : `Top Verified Astrologers Online | Page ${page}`,
      description: search
        ? `Search results for "${search}". Browse ${total} verified astrologers specializing in various astrological services.`
        : `Connect with ${total}+ verified astrologers. Get instant consultations for love, career, health & more. Page ${page} of ${Math.ceil(total / limit)}.`,
      keywords: search
        ? `${search}, astrologers, online astrology consultation`
        : "astrologers, online astrology, verified astrologers, best astrologers, astrology consultation",
      canonical: `/landing/astro?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "numberOfItems": total,
        "itemListElement": safeResults.map((astro, index) => ({
          "@type": "ListItem",
          "position": skip + index + 1,
          "item": {
            "@type": "Person",
            "@id": `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASEURL || 'https://yourdomain.com'}/landing/astro/${astro.slug || astro.id}`,
            "name": astro.name,
            "image": astro.profileImage,
            "description": astro.loginBio || `Expert astrologer specializing in ${astro.primarySkill}`,
            "aggregateRating": astro.avgRating ? {
              "@type": "AggregateRating",
              "ratingValue": astro.avgRating,
              "reviewCount": astro.reviewCount,
              "bestRating": "5",
              "worstRating": "1"
            } : undefined,
            "offers": {
              "@type": "Offer",
              "price": String(astro.charge ?? ""),
              "priceCurrency": "INR",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": String(astro.charge ?? ""),
                "priceCurrency": "INR",
                "unitText": "per minute"
              }
            }
          }
        }))
      }
    };

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: safeResults,
      seo: pageSEO,
    });

  } catch (err: any) {
    console.error("API /api/landing/astro error:", err);
    return NextResponse.json({
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}