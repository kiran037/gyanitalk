// ============================================
// FILE 1: app/api/landing/panchang/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";

const ASTRO_BASE_URL = process.env.ASTROLOGYAPI_BASE_URL;
const USER_ID = process.env.ASTROLOGYAPI_USER_ID;
const API_KEY = process.env.ASTROLOGYAPI_API_KEY;

async function fetchPanchang({
  day,
  month,
  year,
  language = "en",
}: {
  day: number;
  month: number;
  year: number;
  language?: string;
}) {
  if (!USER_ID || !API_KEY || !ASTRO_BASE_URL) {
    throw new Error("Astrology API config missing");
  }

  const payload = new URLSearchParams({
    day: String(day),
    month: String(month),
    year: String(year),
    hour: "5",
    min: "20",
    lat: "11.2",
    lon: "77.0",
    tzone: "5.5",
    name: "AstroUser",
  });

  const authToken = Buffer.from(`${USER_ID}:${API_KEY}`).toString("base64");

  const response = await fetch(
    `${ASTRO_BASE_URL}/v1/advanced_panchang/`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        ...(language && { "Accept-Language": language }),
      },
      body: payload.toString(),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("AstrologyAPI Error:", response.status, text);
    throw new Error(`AstrologyAPI returned ${response.status}`);
  }

  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { day, month, year, language = "en" } = await req.json();

    if (!day || !month || !year) {
      return NextResponse.json(
        { 
          success: false,
          error: "day, month, and year are required and must be numeric",
        },
        { status: 400 }
      );
    }

    const d = Number(day);
    const m = Number(month);
    const y = Number(year);

    if ([d, m, y].some(Number.isNaN)) {
      return NextResponse.json(
        { 
          success: false,
          error: "day, month, and year are required and must be numeric",
        },
        { status: 400 }
      );
    }

    const result = await fetchPanchang({
      day: d,
      month: m,
      year: y,
      language,
    });

    // Return in frontend-expected format
    return NextResponse.json({
      success: true,
      data: result,
      requestDate: { day: d, month: m, year: y },
    });
  } catch (error) {
    console.error("Panchang POST error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch Panchang";
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language") || "en";

    const result = await fetchPanchang({
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      language,
    });

    // Return in frontend-expected format
    return NextResponse.json({
      success: true,
      data: result,
      requestDate: {
        day: today.getDate(),
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      },
    });
  } catch (error) {
    console.error("Panchang GET error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch Panchang";
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
