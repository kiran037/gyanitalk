// app/api/landing/horoscopes/trends/[zodiac]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ---------- helpers ---------- */
function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

/* ---------- constants ---------- */
const VALID_ZODIACS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const ASPECT_KEYS = [
  "health",
  "career",
  "relationship",
  "finances",
  "family",
  "friends",
  "travel",
  "status",
  "physique",
] as const;

/* ---------- handler ---------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ zodiac: string }> },
) {
  try {
    const { zodiac } = await context.params;
    const zodiacLower = zodiac.toLowerCase();

    if (!VALID_ZODIACS.includes(zodiacLower)) {
      return NextResponse.json(
        { success: false, error: "Invalid zodiac sign", validSigns: VALID_ZODIACS },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);

    const type = clamp(Number(searchParams.get("type") || 1), 1, 3);
    const days = clamp(Number(searchParams.get("days") || 7), 2, 90);
    const langcode = searchParams.get("lang") || "en";

    const capitalizedZodiac =
      zodiacLower.charAt(0).toUpperCase() + zodiacLower.slice(1);

    /* ---------- date range ---------- */
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    /* ---------- business date field ---------- */
    const dateField =
      type === 1 ? "date" : "start_date";

    /* ---------- fetch historical data ---------- */
    const horoscopes = await prisma.horoscopes.findMany({
      where: {
        zodiac: capitalizedZodiac,
        type,
        langcode,
        [dateField]: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        [dateField]: "asc",
      },
    });

    if (!horoscopes.length) {
      return NextResponse.json(
        { success: false, error: "No historical data available for this period" },
        { status: 404 },
      );
    }

    /* ---------- normalize timeline ---------- */
    const trends = horoscopes.map((h) => ({
      date: type === 1 ? h.date : h.start_date,
      totalScore: h.total_score,
      aspects: {
        health: h.health,
        career: h.career,
        relationship: h.relationship,
        finances: h.finances,
        family: h.family,
        friends: h.friends,
        travel: h.travel,
        status: h.status,
        physique: h.physique,
      },
    }));

    /* ---------- averages ---------- */
    const avg = (arr: number[]) =>
      Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

    const averages = {
      totalScore: avg(trends.map((t) => t.totalScore)),
      health: avg(trends.map((t) => t.aspects.health)),
      career: avg(trends.map((t) => t.aspects.career)),
      relationship: avg(trends.map((t) => t.aspects.relationship)),
      finances: avg(trends.map((t) => t.aspects.finances)),
      family: avg(trends.map((t) => t.aspects.family)),
      friends: avg(trends.map((t) => t.aspects.friends)),
      travel: avg(trends.map((t) => t.aspects.travel)),
      status: avg(trends.map((t) => t.aspects.status)),
    };

    /* ---------- trend deltas ---------- */
    const mid = Math.floor(trends.length / 2);
    const firstHalf = trends.slice(0, mid);
    const secondHalf = trends.slice(mid);

    const change = (values: number[]) =>
      avg(values.slice(mid)) - avg(values.slice(0, mid));

    const changes: Record<string, number> = {};
    ASPECT_KEYS.forEach((key) => {
      changes[key] = change(trends.map((t) => t.aspects[key]));
    });

    const rising = Object.entries(changes)
      .filter(([, v]) => v > 0.5)
      .map(([k, v]) => ({ aspect: k, change: Number(v.toFixed(1)) }))
      .sort((a, b) => b.change - a.change);

    const falling = Object.entries(changes)
      .filter(([, v]) => v < -0.5)
      .map(([k, v]) => ({ aspect: k, change: Number(v.toFixed(1)) }))
      .sort((a, b) => a.change - b.change);

    const stable = Object.entries(changes)
      .filter(([, v]) => Math.abs(v) <= 0.5)
      .map(([k]) => k);

    /* ---------- response ---------- */
    return NextResponse.json({
      success: true,
      zodiac: capitalizedZodiac,
      type: type === 1 ? "daily" : type === 2 ? "weekly" : "yearly",
      period: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
        days,
      },
      data: {
        trends,
        averages,
        changes: {
          rising,
          falling,
          stable,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trends",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}