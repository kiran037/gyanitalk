// app/api/landing/horoscopes/[zodiac]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_ZODIACS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ zodiac: string }> },
) {
  try {
    const { zodiac } = await context.params;
    const zodiacLower = zodiac.toLowerCase();

    if (!VALID_ZODIACS.includes(zodiacLower)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid zodiac sign",
          validSigns: VALID_ZODIACS,
        },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const langcode = searchParams.get("lang") || "en";

    const capitalizedZodiac =
      zodiacLower.charAt(0).toUpperCase() + zodiacLower.slice(1);

    // Fetch latest daily, weekly, yearly (by business date)
    const [daily, weekly, yearly] = await Promise.all([
      prisma.horoscopes.findFirst({
        where: {
          zodiac: capitalizedZodiac,
          type: 1, // Daily
          langcode,
        },
        orderBy: [
          { date: "desc" },
          { created_at: "desc" },
        ],
      }),
      prisma.horoscopes.findFirst({
        where: {
          zodiac: capitalizedZodiac,
          type: 2, // Weekly
          langcode,
        },
        orderBy: [
          { start_date: "desc" },
          { created_at: "desc" },
        ],
      }),
      prisma.horoscopes.findFirst({
        where: {
          zodiac: capitalizedZodiac,
          type: 3, // Yearly
          langcode,
        },
        orderBy: [
          { start_date: "desc" },
          { created_at: "desc" },
        ],
      }),
    ]);

    const formatHoroscope = (
      horoscope: any,
      type: "daily" | "weekly" | "yearly",
    ) => {
      if (!horoscope) return null;

      return {
        type,
        ...(type === "daily"
          ? { date: horoscope.date }
          : {
              startDate: horoscope.start_date,
              endDate: horoscope.end_date,
            }),
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
    };

    return NextResponse.json({
      success: true,
      zodiac: capitalizedZodiac,
      data: {
        daily: formatHoroscope(daily, "daily"),
        weekly: formatHoroscope(weekly, "weekly"),
        yearly: formatHoroscope(yearly, "yearly"),
      },
    });
  } catch (error) {
    console.error("Error fetching all horoscopes for zodiac:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch horoscopes",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}