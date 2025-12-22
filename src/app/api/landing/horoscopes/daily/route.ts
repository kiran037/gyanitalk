// app/api/landing/horoscopes/daily/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const langcode = searchParams.get("lang") || "en";

    const targetDate = dateParam ? new Date(dateParam) : null;

    // Fetch latest DAILY horoscope per zodiac (by date, not created_at)
    const horoscopes = await Promise.all(
      ZODIAC_SIGNS.map(async (zodiac) => {
        const horoscope = await prisma.horoscopes.findFirst({
          where: {
            zodiac,
            type: 1, // Daily
            langcode,
            ...(targetDate ? { date: targetDate } : {}),
          },
          orderBy: [
            { date: "desc" },        // ✅ correct business ordering
            { created_at: "desc" },  // fallback safety
          ],
        });

        if (!horoscope) return null;

        return {
          zodiac: horoscope.zodiac,
          type: "daily",
          date: horoscope.date,
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
        };
      }),
    );

    const validHoroscopes = horoscopes.filter(Boolean);

    return NextResponse.json({
      success: true,
      count: validHoroscopes.length,
      data: validHoroscopes,
    });
  } catch (error) {
    console.error("Error fetching daily horoscopes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch daily horoscopes",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}