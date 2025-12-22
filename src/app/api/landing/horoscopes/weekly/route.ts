// app/api/landing/horoscopes/weekly/route.ts
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

/* ---------- handler ---------- */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const langcode = searchParams.get("lang") || "en";

    /* ---------- fetch weekly horoscopes ---------- */
    const horoscopes = await Promise.all(
      ZODIAC_SIGNS.map((zodiac) =>
        prisma.horoscopes.findFirst({
          where: {
            zodiac,
            type: 2, // Weekly
            langcode,
          },
          orderBy: [
            { start_date: "desc" },   // business logic
            { created_at: "desc" },   // fallback safety
          ],
        }),
      ),
    );

    const validHoroscopes = horoscopes.filter(isNotNull);

    /* ---------- response ---------- */
    return NextResponse.json({
      success: true,
      count: validHoroscopes.length,
      data: validHoroscopes.map((horoscope) => ({
        zodiac: horoscope.zodiac,
        type: "weekly",
        startDate: horoscope.start_date,
        endDate: horoscope.end_date,
        summary: {
          totalScore: horoscope.total_score,
          luckyColor: horoscope.lucky_color,
          luckyColorCode: horoscope.lucky_color_code,
          luckyNumber: horoscope.lucky_number,
          botResponse: horoscope.bot_response,
        },
        aspects: {
          health: {
            score: horoscope.health,
            remark: horoscope.health_remark,
          },
          career: {
            score: horoscope.career,
            remark: horoscope.career_remark,
          },
          relationship: {
            score: horoscope.relationship,
            remark: horoscope.relationship_remark,
          },
          finances: {
            score: horoscope.finances,
            remark: horoscope.finances_remark,
          },
          family: {
            score: horoscope.family,
            remark: horoscope.family_remark,
          },
          friends: {
            score: horoscope.friends,
            remark: horoscope.friends_remark,
          },
          travel: {
            score: horoscope.travel,
            remark: horoscope.travel_remark,
          },
          status: {
            score: horoscope.status,
            remark: horoscope.status_remark,
          },
          physique: {
            score: horoscope.physique,
            remark: null,
          },
        },
        metadata: {
          lastUpdated: horoscope.updated_at,
          createdAt: horoscope.created_at,
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching weekly horoscopes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch weekly horoscopes",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}