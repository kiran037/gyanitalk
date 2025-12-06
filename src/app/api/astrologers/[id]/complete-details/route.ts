// app/api/astrologers/[id]/complete-details/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    const astrologerId = BigInt(id);

    // Basic astrologer + user info
    const astrologer = await prisma.astrologers.findUnique({
      where: { id: astrologerId, isDelete: false },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            birthDate: true,
            birthTime: true,
            birthPlace: true,
            location: true,
            addressLine1: true,
            addressLine2: true,
            pincode: true,
            gender: true,
            profile: true,
            countryCode: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    if (!astrologer) {
      return NextResponse.json(
        {
          success: false,
          error: "Astrologer not found",
        },
        { status: 404 }
      );
    }

    // Availability details
    const availability = await prisma.astrologer_availabilities.findMany({
      where: {
        astrologerId,
        isDelete: false,
      },
      orderBy: {
        day: "asc",
      },
    });

    // Skills / expertise
    const expertise = await prisma.astrologer_expertises.findMany({
      where: {
        astrologerId,
        isDelete: false,
      },
    });

    // Assigned groups
    const groups = await prisma.astrologer_assign_group.findMany({
      where: {
        astrologerId,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            created_at: true,
          },
        },
      },
    });

    // Commission details
    const commissions = await prisma.commissions.findMany({
      where: {
        astrologerId,
        isDelete: false,
      },
      include: {
        commissionType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Withdraw requests (last 10)
    const withdrawRequests = await prisma.withdrawrequest.findMany({
      where: {
        astrologerId,
        isDelete: 0,
      },
      include: {
        withdrawmethod: {
          select: {
            id: true,
            method_name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: 10,
    });

    const safe = convertPrismaTypes({
      success: true,
      data: {
        basicInfo: astrologer,
        availability,
        expertise,
        groups,
        commissions,
        withdrawRequests,
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching complete details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch complete details",
        message: error.message,
      },
      { status: 500 }
    );
  }
}