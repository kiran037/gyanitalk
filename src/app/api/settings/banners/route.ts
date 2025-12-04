// app/api/settings/banners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET - Fetch all banners
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const bannerTypeId = searchParams.get("bannerTypeId");
    const current = searchParams.get("current") === "true"; // Active right now

    const where: any = { isDelete: false };

    if (activeOnly) {
      where.isActive = true;
    }

    if (bannerTypeId) {
      where.bannerTypeId = BigInt(bannerTypeId);
    }

    if (current) {
      const now = new Date();
      where.fromDate = { lte: now };
      where.toDate = { gte: now };
      where.isActive = true;
    }

    const banners = await prisma.banners.findMany({
      where,
      include: {
        bannerType: {
          select: {
            id: true,
            name: true,
            appId: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const bannersData = banners.map((banner) => ({
      ...banner,
      id: banner.id.toString(),
      bannerTypeId: banner.bannerTypeId.toString(),
      bannerType: banner.bannerType
        ? {
            ...banner.bannerType,
            id: banner.bannerType.id.toString(),
            appId: banner.bannerType.appId.toString(),
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: bannersData,
      total: bannersData.length,
    });
  } catch (error: any) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST - Create new banner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bannerImage,
      fromDate,
      toDate,
      bannerTypeId,
      isActive,
      createdBy,
      modifiedBy,
    } = body;

    // Validation
    if (!bannerImage || !fromDate || !toDate || !bannerTypeId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "BannerImage, fromDate, toDate, and bannerTypeId are required",
        },
        { status: 400 }
      );
    }

    if (!createdBy || !modifiedBy) {
      return NextResponse.json(
        { success: false, error: "CreatedBy and ModifiedBy are required" },
        { status: 400 }
      );
    }

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from >= to) {
      return NextResponse.json(
        { success: false, error: "FromDate must be before ToDate" },
        { status: 400 }
      );
    }

    const newBanner = await prisma.banners.create({
      data: {
        bannerImage,
        fromDate: from,
        toDate: to,
        bannerTypeId: BigInt(bannerTypeId),
        isActive: isActive !== undefined ? isActive : true,
        isDelete: false,
        createdBy: parseInt(createdBy),
        modifiedBy: parseInt(modifiedBy),
      },
      include: {
        bannerType: true,
      },
    });

    const bannerData = {
      ...newBanner,
      id: newBanner.id.toString(),
      bannerTypeId: newBanner.bannerTypeId.toString(),
      bannerType: newBanner.bannerType
        ? {
            ...newBanner.bannerType,
            id: newBanner.bannerType.id.toString(),
            appId: newBanner.bannerType.appId.toString(),
          }
        : null,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Banner created successfully",
        data: bannerData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create banner" },
      { status: 500 }
    );
  }
}
