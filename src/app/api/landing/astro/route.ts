import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") ?? 12)));
    const search = url.searchParams.get("search")?.trim() ?? "";

    const skip = (page - 1) * limit;

    // 1. Build Search Filters
    const where: any = { isActive: true, isDelete: false };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { not: null, contains: search } },
        { metaKeywords: { not: null, contains: search } },
        { loginBio: { not: null, contains: search } },
      ];
    }

    // 2. Fetch all matching IDs (for sorting logic)
    const matching = await prisma.astrologers.findMany({
      where,
      select: { id: true, top_badge: true },
    });

    const allIds: bigint[] = matching.map(m => m.id);

    // 3. Fetch skills and languages for mapping
    const [allSkills, allLanguages] = await Promise.all([
      prisma.skills.findMany({
        where: { isActive: true, isDelete: false },
        select: { id: true, name: true }
      }),
      prisma.languages.findMany({
        select: { id: true, languageName: true }
      })
    ]);

    const skillMap = new Map(allSkills.map(s => [s.id.toString(), s.name]));
    const languageMap = new Map(allLanguages.map(l => [l.id.toString(), l.languageName]));

    // 4. Handle Empty Results
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

    // 5. Sorting Logic (Top Badge > Reviews Count)
    const topBadgeIds = matching
      .filter(m => !!(m.top_badge && String(m.top_badge).trim() !== ""))
      .map(m => m.id);
    const otherIds = matching
      .filter(m => !(m.top_badge && String(m.top_badge).trim() !== ""))
      .map(m => m.id);

    const reviewAgg = await prisma.user_reviews.groupBy({
      by: ["astrologerId"],
      where: { astrologerId: { in: allIds }, isActive: true, isDelete: false },
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

    const getReviewCount = (id: bigint) => reviewMap.get(id.toString())?.count ?? 0;

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
    const pageIds = orderedIds.slice(skip, skip + limit);

    if (pageIds.length === 0) {
      return NextResponse.json({
        page, limit, total, totalPages: Math.ceil(total / limit), data: [],
      });
    }

    // 6. Fetch Full Data for Current Page
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
        _count: { select: { followers: true, reviews: true } },
      },
    });

    const rowById = new Map<string, any>();
    rows.forEach(r => rowById.set(r.id.toString(), r));

    // Used for SEO URLs (Canonical/Schema ID), NOT for images
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL|| '';

    // Helper: Map IDs to Names
    const mapIdsToNames = (idsString: string | null, map: Map<string, string>) => {
      if (!idsString) return "";
      return idsString
        .split(',')
        .map(id => map.get(id.trim()))
        .filter(Boolean)
        .join(', ');
    };

    // 7. Transform Data
    const results = pageIds.map((idBig) => {
      const r = rowById.get(idBig.toString());
      if (!r) return null;

      const astrologerSlug = r.slug || r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      // Map IDs to Text
      const languageNames = mapIdsToNames(r.languageKnown, languageMap);
      const primarySkillName = mapIdsToNames(r.primarySkill, skillMap) || "Astrologer";
      const allSkillNames = mapIdsToNames(r.allSkill, skillMap);

      const agg = reviewMap.get(r.id.toString());
      const avgRating = agg?.avg ?? null;
      const reviewCount = agg?.count ?? (r._count?.reviews ?? 0);

      // Raw Image Path (Frontend handles cleaning)
      const rawProfileImage = r.profileImage;

      return {
        id: r.id.toString(),
        name: r.name,
        slug: astrologerSlug,
        profileImage: rawProfileImage, // Sending raw URL
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
          metaTitle: r.metaTitle || `${r.name} - Expert ${primarySkillName}`,
          metaDescription: r.metaDescription || `Consult with ${r.name}, experienced astrologer. Get expert guidance on ${primarySkillName}. ₹${r.charge}/min`,
          metaKeywords: r.metaKeywords || `${r.name}, astrologer, ${primarySkillName}, online consultation`,
          canonicalUrl: r.canonicalUrl || `/landing/astro/${astrologerSlug}`,
          ogTitle: r.ogTitle || r.metaTitle || r.name,
          ogDescription: r.ogDescription || r.metaDescription,
          twitterTitle: r.twitterTitle || r.metaTitle || r.name,
          twitterDescription: r.twitterDescription || r.metaDescription,
          // Sending raw URLs for SEO images as well
          ogImage: r.ogImage || rawProfileImage,
          twitterImage: r.twitterImage || rawProfileImage,

          schemaJson: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": r.name,
            "jobTitle": primarySkillName,
            "url": `${baseUrl}/landing/astro/${astrologerSlug}`,
            "image": rawProfileImage, // Raw URL
            "description": r.loginBio || `Expert astrologer with ${r.experienceInYears}+ years of experience`,
            "knowsAbout": allSkillNames ? allSkillNames.split(',').map((s: string) => s.trim()) : [],
            "knowsLanguage": languageNames ? languageNames.split(',').map((l: string) => l.trim()) : []
          }),
        }
      };
    }).filter(Boolean);

    const safeResults = results.filter((r): r is NonNullable<typeof r> => r != null);

    // 8. Page Level SEO
    const pageSEO = {
      title: search
        ? `${search} - Find Astrologers | Page ${page}`
        : `Top Verified Astrologers Online | Page ${page}`,
      description: search
        ? `Search results for "${search}". Browse verified astrologers.`
        : `Connect with ${total}+ verified astrologers. Page ${page}.`,
      keywords: "astrologers, online astrology, verified astrologers",
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
            "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/landing/astro/${astro.slug}`,
            "name": astro.name,
            "image": astro.profileImage, // Raw URL
            "jobTitle": astro.primarySkill,
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