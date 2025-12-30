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
      id: true,
      slug: true,
      name: true,
      updated_at: true,
    },
  });

  // ✅ Unicode-safe slugify (Hindi + English)
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '') // unicode letters & numbers
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  // ✅ Ensure slug is unique in DB
  const generateUniqueSlug = async (baseSlug: string) => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const exists = await prisma.astrologers.findFirst({
        where: { slug },
        select: { id: true },
      });

      if (!exists) return slug;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  };

  const updates: Promise<any>[] = [];

  const urls = await Promise.all(
    astros.map(async (a) => {
      let finalSlug = a.slug?.trim();

      // 🔥 slug missing → generate + save in DB
      if (!finalSlug) {
        const baseSlug = slugify(a.name);

        // safety: agar name bhi empty ho
        if (!baseSlug) return '';

        finalSlug = await generateUniqueSlug(baseSlug);

        updates.push(
          prisma.astrologers.update({
            where: { id: a.id },
            data: { slug: finalSlug },
          })
        );
      }

      const lastmod = (a.updated_at ?? new Date())
        .toISOString()
        .split('T')[0];

      return `
  <url>
    <loc>${BASE_URL}/talk-to-astrologers/${finalSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
  );

  // ✅ DB updates execute once
  if (updates.length > 0) {
    await Promise.all(updates);
  }

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.filter(Boolean).join('')}
</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    }
  );
}


