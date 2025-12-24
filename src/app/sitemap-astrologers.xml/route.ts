import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitalk.com";

export async function GET() {
  const astros = await prisma.astrologers.findMany({
    where: {
      isActive: true,
      isDelete: false,
    },
    select: {
      slug: true,
      name: true,
      updated_at: true,
    },
  });

  // simple slugify helper
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // special chars remove
      .replace(/\s+/g, '-')         // spaces → -
      .replace(/-+/g, '-');         // extra -

  const urls = astros
    .map((a) => {
      const finalSlug = a.slug?.trim()
        ? a.slug
        : slugify(a.name);

      const lastmod = (a.updated_at ?? new Date())
        .toISOString()
        .split('T')[0];

      return `
  <url>
    <loc>${BASE_URL}/landing/astro/${finalSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
    .join('');

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    }
  );
}
