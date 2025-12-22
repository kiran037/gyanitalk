import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitalk.com";

export async function GET() {
  const astros = await prisma.astrologers.findMany({
    where: { isActive: true, isDelete: false, slug: { not: null } },
    select: { slug: true, updated_at: true },
  });

  const urls = astros.map(
    (a) => `
  <url>
    <loc>${BASE_URL}/landing/astro/${a.slug}</loc>
    <lastmod>${a.updated_at?.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
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