// app/api/landing/horoscopes/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_ZODIACS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const VALID_ASPECTS = [
  "health", "career", "relationship", "finances",
  "family", "friends", "travel", "status", "physique",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const zodiac = searchParams.get("zodiac")?.toLowerCase();
    const type = searchParams.get("type")
      ? Number(searchParams.get("type"))
      : null;

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const minScore = searchParams.get("minScore")
      ? Number(searchParams.get("minScore"))
      : null;

    const maxScore = searchParams.get("maxScore")
      ? Number(searchParams.get("maxScore"))
      : null;

    const aspect = searchParams.get("aspect");
    const aspectMinScore = searchParams.get("aspectMinScore")
      ? Number(searchParams.get("aspectMinScore"))
      : null;

    const langcode = searchParams.get("lang") || "en";
    const limit = Math.min(
      Number(searchParams.get("limit")) || 10,
      50,
    );

    const sortBy = searchParams.get("sortBy") || "date"; // date | total_score
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // ---------- validation ----------
    if (zodiac && !VALID_ZODIACS.includes(zodiac)) {
      return NextResponse.json(
        { success: false, error: "Invalid zodiac sign", validSigns: VALID_ZODIACS },
        { status: 400 },
      );
    }

    if (type && ![1, 2, 3].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid type (1 daily, 2 weekly, 3 yearly)" },
        { status: 400 },
      );
    }

    if (aspect && !VALID_ASPECTS.includes(aspect)) {
      return NextResponse.json(
        { success: false, error: "Invalid aspect", validAspects: VALID_ASPECTS },
        { status: 400 },
      );
    }

    // ---------- where ----------
    const where: any = { langcode };

    if (zodiac) {
      where.zodiac = zodiac.charAt(0).toUpperCase() + zodiac.slice(1);
    }

    if (type !== null) {
      where.type = type;
    }

    // business date filtering
    if (startDate || endDate) {
      if (type === 1) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      } else {
        where.start_date = {};
        if (startDate) where.start_date.gte = new Date(startDate);
        if (endDate) where.start_date.lte = new Date(endDate);
      }
    }

    if (minScore !== null || maxScore !== null) {
      where.total_score = {};
      if (minScore !== null) where.total_score.gte = minScore;
      if (maxScore !== null) where.total_score.lte = maxScore;
    }

    if (aspect && aspectMinScore !== null) {
      where[aspect] = { gte: aspectMinScore };
    }

    // ---------- order ----------
    let orderBy: any;

    if (sortBy === "total_score") {
      orderBy = { total_score: sortOrder };
    } else {
      orderBy =
        type === 1
          ? { date: sortOrder }
          : { start_date: sortOrder };
    }

    // ---------- query ----------
    const horoscopes = await prisma.horoscopes.findMany({
      where,
      orderBy,
      take: limit,
    });

    if (!horoscopes.length) {
      return NextResponse.json(
        { success: false, error: "No horoscopes found" },
        { status: 404 },
      );
    }

    // ---------- format ----------
    const data = horoscopes.map((h) => ({
      id: h.id.toString(), // 🔒 BigInt safe
      zodiac: h.zodiac,
      type: h.type === 1 ? "daily" : h.type === 2 ? "weekly" : "yearly",
      date: h.date,
      startDate: h.start_date,
      endDate: h.end_date,
      summary: {
        totalScore: h.total_score,
        luckyColor: h.lucky_color,
        luckyColorCode: h.lucky_color_code,
        luckyNumber: h.lucky_number,
        botResponse: h.bot_response,
      },
      aspects: {
        health: { score: h.health, remark: h.health_remark },
        career: { score: h.career, remark: h.career_remark },
        relationship: { score: h.relationship, remark: h.relationship_remark },
        finances: { score: h.finances, remark: h.finances_remark },
        family: { score: h.family, remark: h.family_remark },
        friends: { score: h.friends, remark: h.friends_remark },
        travel: { score: h.travel, remark: h.travel_remark },
        status: { score: h.status, remark: h.status_remark },
        physique: { score: h.physique, remark: null },
      },
      metadata: {
        lastUpdated: h.updated_at,
        createdAt: h.created_at,
      },
    }));

    const scores = data.map((d) => d.summary.totalScore);

    return NextResponse.json({
      success: true,
      statistics: {
        count: data.length,
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
      },
      data,
    });
  } catch (error) {
    console.error("Error searching horoscopes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search horoscopes",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}