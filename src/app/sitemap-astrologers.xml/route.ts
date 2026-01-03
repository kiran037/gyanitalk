import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitalk.com";

export async function GET() {
  try {
    // 1. Fetch data (Read-only)
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
        created_at: true,
      },
    });

    // 2. Map URLs
    const urls = astros.map((a) => {
      // Logic: Use existing DB slug, OR generate fallback on the fly.
      // NOTE: This fallback logic matches your API route exactly.
      let finalSlug = a.slug;

      if (!finalSlug || finalSlug.trim() === "") {
        finalSlug = a.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-') // Replace special chars with hyphen
          .replace(/^-|-$/g, '');      // Remove start/end hyphens
      }

      // Safety: If name is empty and no slug, skip this entry
      if (!finalSlug) return null;

      // Use updated_at, fall back to created_at, fall back to now
      const dateObj = a.updated_at || a.created_at || new Date();
      const lastmod = dateObj.toISOString(); // Full ISO string is standard

      return `
    <url>
      <loc>${BASE_URL}/talk-to-astrologers/${finalSlug}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>`;
    });

    // 3. Build XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.filter(Boolean).join('')}
</urlset>`;

    // 4. Return with Cache Headers
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Cache this response for 1 hour (3600s) to save DB resources
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });

  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}