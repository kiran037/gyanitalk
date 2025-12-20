// app/api/landing/home/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pages_type } from "@/generated/client/client";

export async function GET() {
  try {
    const page = await prisma.pages.findFirst({
      where: {
        type: pages_type.home,
        isActive: true,
      },
      select: {
        title: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        canonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterImage: true,
        schemaJson: true,
        updated_at: true,
      },
    });

    if (!page) {
      return NextResponse.json({
        success: false,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("HOME SEO FETCH ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load home SEO",
      },
      { status: 500 }
    );
  }
}