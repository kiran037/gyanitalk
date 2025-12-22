import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitalk.com";

const ZODIACS = [
  "aries","taurus","gemini","cancer","leo","virgo",
  "libra","scorpio","sagittarius","capricorn","aquarius","pisces",
];

export async function GET() {
  const urls = ZODIACS.map(
    (z) => `
  <url>
    <loc>${BASE_URL}/landing/horoscope/${z}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
  ).join("");

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
    { headers: { "Content-Type": "application/xml" } }
  );
}