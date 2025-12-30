import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitalk.com";

// How many days ahead you want indexed (SEO-safe: 30–90 days)
const DAYS_TO_GENERATE = 30;

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function GET() {
  const today = new Date();

  const urls: string[] = [];

  // Base Panchang page (Today)
  urls.push(`
  <url>
    <loc>${BASE_URL}/panchang</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);

  // Future & past Panchang dates
  for (let i = 0; i <= DAYS_TO_GENERATE; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dateStr = formatDate(d);

    urls.push(`
  <url>
    <loc>${BASE_URL}/panchang?date=${dateStr}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml",
      },
    }
  );
}