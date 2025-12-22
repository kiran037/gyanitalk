// app/api/landing/horoscopes/highlights/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ---------- helpers ---------- */
function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/* ---------- constants ---------- */
const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
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
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const dateParam = searchParams.get("date");
    const langcode = searchParams.get("lang") || "en";
    const aspect = searchParams.get("aspect");

    const targetDate = dateParam ? new Date(dateParam) : null;

    /* ---------- fetch daily horoscopes ---------- */
    const horoscopes = await Promise.all(
      ZODIAC_SIGNS.map((zodiac) =>
        prisma.horoscopes.findFirst({
          where: {
            zodiac,
            type: 1, // daily only
            langcode,
            ...(targetDate ? { date: targetDate } : {}),
          },
          orderBy: [
            { date: "desc" },        // business logic
            { created_at: "desc" },  // safety fallback
          ],
        }),
      ),
    );

    const validHoroscopes = horoscopes.filter(isNotNull);

    if (!validHoroscopes.length) {
      return NextResponse.json(
        { success: false, error: "No horoscope data available" },
        { status: 404 },
      );
    }

    /* ---------- sort ---------- */
    const sorted = [...validHoroscopes].sort(
      (a, b) => b.total_score - a.total_score,
    );

    const bestSign = sorted[0];
    const worstSign = sorted[sorted.length - 1];

    const averageScore = Math.round(
      sorted.reduce((sum, h) => sum + h.total_score, 0) / sorted.length,
    );

    /* ---------- aspect aggregation ---------- */
    const aspectScores: Record<
      (typeof ASPECT_KEYS)[number],
      { zodiac: string; score: number }[]
    > = Object.fromEntries(
      ASPECT_KEYS.map((k) => [k, []]),
    ) as any;

    sorted.forEach((h) => {
      ASPECT_KEYS.forEach((key) => {
        aspectScores[key].push({
          zodiac: h.zodiac,
          score: h[key],
        });
      });
    });

    const topAspects: Record<string, { zodiac: string; score: number }[]> = {};
    ASPECT_KEYS.forEach((key) => {
      topAspects[key] = [...aspectScores[key]]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    });

    let aspectHighlight: any = null;
    if (aspect && aspect in aspectScores) {
      const list = aspectScores[aspect as keyof typeof aspectScores];
      aspectHighlight = {
        aspect,
        topSigns: [...list].sort((a, b) => b.score - a.score).slice(0, 3),
        average: Math.round(
          list.reduce((sum, i) => sum + i.score, 0) / list.length,
        ),
      };
    }

    /* ---------- score buckets ---------- */
    const bucket = (min: number, max?: number) =>
      sorted.filter(
        (h) =>
          h.total_score >= min &&
          (max === undefined || h.total_score < max),
      );

    /* ---------- response ---------- */
    return NextResponse.json({
      success: true,
      date:
        targetDate?.toISOString().split("T")[0] ??
        new Date().toISOString().split("T")[0],
      summary: {
        totalSigns: sorted.length,
        averageScore,
        highestScore: bestSign.total_score,
        lowestScore: worstSign.total_score,
      },
      highlights: {
        signOfTheDay: {
          zodiac: bestSign.zodiac,
          score: bestSign.total_score,
          luckyColor: bestSign.lucky_color,
          luckyNumber: bestSign.lucky_number,
          message: "Today is your day to shine!",
        },
        challenging: {
          zodiac: worstSign.zodiac,
          score: worstSign.total_score,
          message: "Take it easy and focus on self-care today.",
        },
      },
      topThree: sorted.slice(0, 3).map((h) => ({
        zodiac: h.zodiac,
        score: h.total_score,
        luckyColor: h.lucky_color,
      })),
      bottomThree: sorted.slice(-3).reverse().map((h) => ({
        zodiac: h.zodiac,
        score: h.total_score,
      })),
      byCategory: {
        excellent: bucket(80).map((h) => h.zodiac),
        veryGood: bucket(65, 80).map((h) => h.zodiac),
        good: bucket(50, 65).map((h) => h.zodiac),
        fair: bucket(35, 50).map((h) => h.zodiac),
        challenging: bucket(0, 35).map((h) => h.zodiac),
      },
      topAspects,
      ...(aspectHighlight && { aspectHighlight }),
    });
  } catch (error) {
    console.error("Error fetching highlights:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch highlights",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}