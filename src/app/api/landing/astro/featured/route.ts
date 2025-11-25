// src/app/api/landing/astro/featured/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const matching = await prisma.astrologers.findMany({
      where: { 
        isActive: true, 
        isDelete: false,
        top_badge: { not: null } 
      },
      select: { id: true, top_badge: true },
      take: 200 
    });

    const allIds = matching.map(m => m.id);

    if (allIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

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

    const sortedIds = [...allIds].sort((a, b) => {
      const aStats = reviewMap.get(a.toString()) || { count: 0, avg: 0 };
      const bStats = reviewMap.get(b.toString()) || { count: 0, avg: 0 };

      if (aStats.count !== bStats.count) {
        return bStats.count - aStats.count;
      }
      return (bStats.avg || 0) - (aStats.avg || 0);
    });

    const TOP_N = 15;
    const topIds = sortedIds.slice(0, TOP_N);

    if (topIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const astrologers = await prisma.astrologers.findMany({
      where: { id: { in: topIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        profileImage: true,
        primarySkill: true,
        allSkill: true,
        charge: true,
        experienceInYears: true,
        languageKnown: true,
        isVerified: true,
        top_badge: true,
        chatStatus: true,
        callStatus: true,
        loginBio: true,
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });

    const astroById = new Map(astrologers.map(a => [a.id.toString(), a]));
    const orderedAstros = topIds
      .map(id => astroById.get(id.toString()))
      .filter(Boolean) as typeof astrologers;

    const allSkills = await prisma.skills.findMany({
      where: { isActive: true, isDelete: false },
      select: { id: true, name: true }
    });
    const skillMap = new Map(allSkills.map(s => [s.id.toString(), s.name]));

    const allLanguages = await prisma.languages.findMany({
      select: { id: true, languageName: true }
    });
    const languageMap = new Map(allLanguages.map(l => [l.id.toString(), l.languageName]));

    const results = orderedAstros.map(astro => {
      const slug = astro.slug || astro.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const primarySkillName = astro.primarySkill
        ? (skillMap.get(astro.primarySkill) || astro.primarySkill)
        : null;

      const allSkillNames = astro.allSkill
        ? astro.allSkill.split(',')
          .slice(0, 3)
          .map((id: string) => skillMap.get(id.trim()) || id.trim())
          .join(', ')
        : null;

      const languageNames = astro.languageKnown
        ? astro.languageKnown.split(',')
          .slice(0, 3)
          .map((id: string) => languageMap.get(id.trim()) || id.trim())
          .filter(Boolean)
          .join(', ')
        : null;

      const stats = reviewMap.get(astro.id.toString());

      return {
        id: astro.id.toString(),
        name: astro.name,
        slug,
        profileImage: astro.profileImage,
        primarySkill: primarySkillName,
        allSkill: allSkillNames,
        charge: astro.charge,
        experienceInYears: astro.experienceInYears,
        languageKnown: languageNames,
        isVerified: astro.isVerified,
        chatStatus: astro.chatStatus,
        callStatus: astro.callStatus,
        reviewCount: stats?.count ?? astro._count?.reviews ?? 0,
        avgRating: stats?.avg ? Number(stats.avg.toFixed(1)) : null,
        loginBio: astro.loginBio,
        badges: {
          top_badge: astro.top_badge
        }
      };
    });

    return NextResponse.json({ data: results });

  } catch (err: any) {
    console.error("Featured astrologers API error:", err);
    return NextResponse.json({
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}