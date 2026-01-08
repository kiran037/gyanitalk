///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/astro/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Helper: Convert IDs ("2,35") -> Names ("Vedic, Tarot")
const mapIdsToNames = (idsString: string | null, map: Map<string, string>) => {
  if (!idsString) return "";
  return idsString
    .split(',')
    .map(id => id.trim())
    .map(id => map.get(id)) // Look up the name by ID
    .filter(Boolean) // Remove nulls/undefined
    .join(', ');
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    let astrologer = null;

    // --- 1. Fetch Astrologer Data (Select everything needed) ---
    const astrologerSelect = {
      id: true,
      userId: true,
      name: true,
      slug: true,
      email: true,
      contactNo: true,
      gender: true,
      birthDate: true,
      primarySkill: true, // RAW IDs
      allSkill: true,     // RAW IDs
      languageKnown: true,// RAW IDs
      profileImage: true,
      charge: true,
      experienceInYears: true,
      dailyContribution: true,
      currentCity: true,
      highestQualification: true,
      degree: true,
      college: true,
      learnAstrology: true,
      isVerified: true,
      isLiveOff: true,
      monthlyEarning: true,
      whatwillDo: true,
      whyOnBoard: true,
      top_badge: true,
      featured_badge: true,
      chatStatus: true,
      chatWaitTime: true,
      callStatus: true,
      callWaitTime: true,
      videoCallRate: true,
      reportRate: true,
      instaProfileLink: true,
      facebookProfileLink: true,
      linkedInProfileLink: true,
      youtubeChannelLink: true,
      websiteProfileLink: true,
      loginBio: true,
      created_at: true,
      updated_at: true,
      
      // Relations
      stories: {
        where: { created_at: { not: null } },
        select: {
          id: true, mediaType: true, media: true, created_at: true,
          _count: { select: { story_view_count: true } }
        },
        orderBy: { created_at: "desc" as const },
        take: 20,
      },
      astrologerGifts: {
        where: { isActive: true, isDelete: false },
        select: {
          id: true, giftId: true, giftAmount: true, created_at: true,
          gift: { select: { id: true, name: true, image: true, amount: true } }
        },
        orderBy: { created_at: "desc" as const },
        take: 10,
      },
      commissions: {
        where: { isActive: true, isDelete: false },
        select: {
          id: true, commissionTypeId: true, commission: true, created_at: true,
          commissionType: { select: { id: true, name: true } }
        },
      },
      reviews: {
        where: { isActive: true, isDelete: false },
        select: {
          id: true, rating: true, review: true, reply: true, isPublic: true, created_at: true,
          user: { select: { id: true, name: true, profile: true } }
        },
        orderBy: { created_at: "desc" as const },
        take: 50,
      },
      users: { select: { id: true, name: true, email: true, profile: true } },
      _count: {
        select: { followers: true, reviews: true, chatrequests: true, callrequests: true, order_requests: true }
      }
    };

    // Try finding by Slug
    astrologer = await prisma.astrologers.findFirst({
      where: { slug: slug, isActive: true, isDelete: false },
      select: astrologerSelect,
    });

    // Try finding by ID (Legacy)
    if (!astrologer) {
      try {
        const astrologerId = BigInt(slug);
        astrologer = await prisma.astrologers.findFirst({
          where: { id: astrologerId, isActive: true, isDelete: false },
          select: astrologerSelect,
        });
      } catch (e) { /* Not an ID */ }
    }

    if (!astrologer) {
      return NextResponse.json({ error: "Astrologer not found" }, { status: 404 });
    }

    // --- 2. Fetch Lookup Tables ---
    const [assistants, availabilities, reviewsAgg, allSkills, allLanguages] = await Promise.all([
      prisma.astrologer_assistants.findMany({
        where: { astrologerId: astrologer.id, isActive: true, isDelete: false },
        select: {
          id: true, name: true, email: true, contactNo: true, gender: true,
          primarySkill: true, allSkill: true, languageKnown: true, experienceInYears: true, profile: true,
        },
      }),
      prisma.astrologer_availabilities.findMany({
        where: { astrologerId: astrologer.id, isActive: true, isDelete: false },
        select: { id: true, day: true, fromTime: true, toTime: true },
        orderBy: { id: "asc" },
      }),
      prisma.user_reviews.aggregate({
        where: { astrologerId: astrologer.id, isActive: true, isDelete: false },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      prisma.skills.findMany({
        where: { isActive: true, isDelete: false },
        select: { id: true, name: true }
      }),
      prisma.languages.findMany({
        select: { id: true, languageName: true }
      })
    ]);

    // --- 3. Build Maps (ID -> Name) ---
    const skillMap = new Map(allSkills.map(s => [s.id.toString(), s.name]));
    const languageMap = new Map(allLanguages.map(l => [l.id.toString(), l.languageName]));

    const avgRating = reviewsAgg._avg?.rating ?? null;
    const reviewsCount = reviewsAgg._count?._all ?? 0;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.gyanitalk.com';

    // --- 4. Resolve IDs to Names ---
    const allSkillNames = mapIdsToNames(astrologer.allSkill, skillMap);
    // If no primary skill map found, default to "Astrologer"
    const primarySkillName = mapIdsToNames(astrologer.primarySkill, skillMap) || "Astrologer"; 
    const languageNames = mapIdsToNames(astrologer.languageKnown, languageMap);

    // ✅ Use Raw Image URL (Frontend handles cleaning)
    const rawProfileImage = astrologer.profileImage;

    // Generate slug
    const astrologerSlug = astrologer.slug || astrologer.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const astrologerUrl = `${baseUrl}/talk-to-astrologers${astrologerSlug}`;

    // --- 5. FORCE GENERATE SEO ---
    const seoData = {
      slug: astrologerSlug,
      
      metaTitle: `${astrologer.name} - Expert ${primarySkillName} | ${astrologer.experienceInYears}+ Years Experience`,
      
      metaDescription: `Consult with ${astrologer.name}, a verified ${primarySkillName} with ${astrologer.experienceInYears}+ years of experience. ${astrologer.loginBio?.substring(0, 100) || 'Get expert astrological guidance'}. Starting at ₹${astrologer.charge}/min.`,
      
      metaKeywords: `${astrologer.name}, ${allSkillNames}, astrologer, online consultation, ${languageNames}, ${astrologer.currentCity || 'India'}`,
      
      canonicalUrl: astrologerUrl,
      
      ogTitle: `${astrologer.name} | Expert ${primarySkillName}`,
      ogDescription: `Connect with ${astrologer.name}, a verified astrologer with ${astrologer.experienceInYears}+ years experience.`,
      ogImage: rawProfileImage, // Raw URL
      ogUrl: astrologerUrl,
      ogType: 'profile',
      
      twitterTitle: `${astrologer.name} on Gyanitalk`,
      twitterDescription: `Expert ${primarySkillName} with ${astrologer.experienceInYears}+ years experience.`,
      twitterImage: rawProfileImage, // Raw URL
      twitterCard: 'summary_large_image',

      // Schema
      schemaJson: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": astrologer.name,
        "jobTitle": primarySkillName,
        "description": astrologer.loginBio,
        "image": rawProfileImage, // Raw URL
        "url": astrologerUrl,
        "telephone": astrologer.contactNo,
        "email": astrologer.email,
        "address": astrologer.currentCity ? { "@type": "Place", "name": astrologer.currentCity } : undefined,
        "alumniOf": astrologer.college ? { "@type": "Organization", "name": astrologer.college } : undefined,
        "aggregateRating": avgRating ? {
          "@type": "AggregateRating",
          "ratingValue": avgRating,
          "reviewCount": reviewsCount,
          "bestRating": "5",
          "worstRating": "1"
        } : undefined,
        "offers": {
          "@type": "Offer",
          "price": String(astrologer.charge || ""),
          "priceCurrency": "INR",
          "description": "Chat consultation",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": String(astrologer.charge || ""),
            "priceCurrency": "INR",
            "unitText": "per minute"
          }
        },
        "knowsAbout": allSkillNames ? allSkillNames.split(',').map(s => s.trim()) : [],
        "knowsLanguage": languageNames ? languageNames.split(',').map(l => l.trim()) : [],
      }),

      breadcrumbSchema: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
          { "@type": "ListItem", "position": 2, "name": "Astrologers", "item": `${baseUrl}/talk-to-astrologers` },
          { "@type": "ListItem", "position": 3, "name": astrologer.name, "item": astrologerUrl }
        ]
      })
    };

    // --- 6. Payload ---
    const payload = {
      id: astrologer.id.toString(),
      userId: astrologer.userId.toString(),
      name: astrologer.name,
      seo: seoData,
      email: astrologer.email,
      contactNo: astrologer.contactNo,
      gender: astrologer.gender,
      birthDate: astrologer.birthDate,
      
      // ✅ Corrected Text Values
      primarySkill: primarySkillName,
      allSkill: allSkillNames,
      languageKnown: languageNames,
      profileImage: rawProfileImage, // Raw URL
      
      charge: astrologer.charge,
      experienceInYears: astrologer.experienceInYears,
      dailyContribution: astrologer.dailyContribution,
      currentCity: astrologer.currentCity,
      highestQualification: astrologer.highestQualification,
      degree: astrologer.degree,
      college: astrologer.college,
      learnAstrology: astrologer.learnAstrology,
      isVerified: astrologer.isVerified,
      isLiveOff: astrologer.isLiveOff,
      monthlyEarning: astrologer.monthlyEarning,
      whatwillDo: astrologer.whatwillDo || "NA",
      whyOnBoard: astrologer.whyOnBoard || "NA",
      top_badge: astrologer.top_badge,
      featured_badge: astrologer.featured_badge,
      chatStatus: astrologer.chatStatus,
      chatWaitTime: astrologer.chatWaitTime,
      callStatus: astrologer.callStatus,
      callWaitTime: astrologer.callWaitTime,
      videoCallRate: astrologer.videoCallRate,
      reportRate: astrologer.reportRate,
      socialLinks: {
        instagram: astrologer.instaProfileLink,
        facebook: astrologer.facebookProfileLink,
        linkedin: astrologer.linkedInProfileLink,
        youtube: astrologer.youtubeChannelLink,
        website: astrologer.websiteProfileLink,
      },
      loginBio: astrologer.loginBio,
      created_at: astrologer.created_at,
      updated_at: astrologer.updated_at,
      
      assistants: assistants.map(a => ({
        id: a.id.toString(),
        name: a.name,
        email: a.email,
        contactNo: a.contactNo,
        gender: a.gender,
        primarySkill: mapIdsToNames(a.primarySkill, skillMap),
        allSkill: mapIdsToNames(a.allSkill, skillMap),
        languageKnown: mapIdsToNames(a.languageKnown, languageMap),
        experienceInYears: a.experienceInYears,
        profile: a.profile, // Raw URL
      })),

      availabilities: availabilities.map(av => ({
        id: av.id.toString(),
        day: av.day,
        fromTime: av.fromTime,
        toTime: av.toTime,
      })),

      stories: astrologer.stories.map((s: any) => ({
        id: s.id.toString(),
        mediaType: s.mediaType,
        media: s.media, // Raw URL
        created_at: s.created_at,
        viewCount: s._count.story_view_count,
      })),

      gifts: astrologer.astrologerGifts.map((g: any) => ({
        id: g.id.toString(),
        giftId: g.giftId.toString(),
        giftAmount: g.giftAmount ? g.giftAmount.toString() : null,
        created_at: g.created_at,
        gift: g.gift ? {
          id: g.gift.id.toString(),
          name: g.gift.name,
          image: g.gift.image, // Raw URL
          amount: g.gift.amount,
        } : null,
      })),

      commissions: astrologer.commissions.map((c: any) => ({
        id: c.id.toString(),
        commissionTypeId: c.commissionTypeId.toString(),
        commission: c.commission,
        created_at: c.created_at,
        commissionType: {
          id: c.commissionType.id.toString(),
          name: c.commissionType.name,
        }
      })),

      reviews: astrologer.reviews.map((r: any) => ({
        id: r.id.toString(),
        rating: r.rating,
        review: r.review,
        reply: r.reply,
        isPublic: r.isPublic,
        created_at: r.created_at,
        user: r.user ? {
          id: r.user.id.toString(),
          name: r.user.name,
          profile: r.user.profile, // Raw URL
        } : null,
      })),
      avgRating: avgRating ? Number(avgRating.toFixed(1)) : null,
      reviewsCount,
      stats: {
        followerCount: astrologer._count.followers,
        reviewCount: astrologer._count.reviews,
        chatRequestCount: astrologer._count.chatrequests,
        callRequestCount: astrologer._count.callrequests,
        orderCount: astrologer._count.order_requests,
      },
      user: astrologer.users ? {
        id: astrologer.users.id.toString(),
        name: astrologer.users.name,
        email: astrologer.users.email,
        profile: astrologer.users.profile, // Raw URL
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: payload
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'index, follow',
        'Content-Type': 'application/json'
      }
    });

  } catch (err: any) {
    console.error("GET /api/landing/astro/[slug] error:", err);
    return NextResponse.json({
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}