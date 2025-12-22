import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitalk.com";

export async function GET() {
  const pages = [
    "/",
    "/landing/horoscope",
    "/landing/about-us",
    "/landing/contact",
    "/landing/privacy-policy",
    "/landing/terms-of-service",
  ];

  const urls = pages
    .map(
      (p) => `
  <url>
    <loc>${BASE_URL}${p}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("");

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
    { headers: { "Content-Type": "application/xml" } }
  );
}