import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitalk.com";

export async function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${BASE_URL}/sitemap-static.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-horoscope.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-blogs.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-courses.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-products.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-astrologers.xml</loc></sitemap>
</sitemapindex>`;

  return new NextResponse(body, {
    headers: { "Content-Type": "application/xml" },
  });
}