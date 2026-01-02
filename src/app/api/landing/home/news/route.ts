import { NextResponse } from "next/server";
import {prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const news = await prisma.astrotalk_in_news.findMany({
      where: {
        isActive: true,
        isDelete: false,
      },
      select: {
        id: true,
        channel: true,
        link: true,
        bannerImage: true,
        description: true,
        newsDate: true,
      },
      orderBy: {
        newsDate: 'desc',
      },
      take: 10,
    });

    // Convert BigInt to String
    const formattedNews = news.map((item) => ({
      ...item,
      id: item.id.toString(),
    }));

    return NextResponse.json({ success: true, data: formattedNews });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch news" }, { status: 500 });
  }
}