
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Fetch the list of video IDs from your backend
    const res = await fetch("https://astro.gyanitalk.com/api/reels", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`External API error: ${res.status}`);
    }

    const json = await res.json();
    const rawList = json.recordList || [];

    // 2. Fetch Titles for ALL videos in parallel using YouTube oEmbed (No API Key needed)
    const videosWithTitles = await Promise.all(
      rawList.map(async (item: any) => {
        let title = "Customer Testimonial"; // Fallback title

        try {
          const oEmbedRes = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${item.id}&format=json`
          );
          if (oEmbedRes.ok) {
            const oEmbedJson = await oEmbedRes.json();
            title = oEmbedJson.title;
          }
        } catch (e) {
          console.error(`Failed to fetch title for ${item.id}`, e);
        }

        return {
          id: item.id,
          title: title, // Real YouTube Title
          thumbnail: `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
          videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
        };
      })
    );

    return NextResponse.json({ success: true, data: videosWithTitles });
  } catch (error) {
    console.error("Error fetching reels:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reels" },
      { status: 500 }
    );
  }
}