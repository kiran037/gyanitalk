import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitalk.com";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!INDEXNOW_KEY) {
      return NextResponse.json(
        { success: false, error: "INDEXNOW_KEY missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const urls: string[] = body.urls;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: "URLs array required" },
        { status: 400 }
      );
    }

    const payload = {
      host: new URL(SITE_URL).hostname,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { success: false, error: "IndexNow failed", details: text },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submitted: urls.length,
    });
  } catch (error) {
    console.error("IndexNow error:", error);
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}