// ===================================
// FILE: app/api/request/groups/[id]/astrologers/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ FIX: Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { success: false, error: "Invalid group ID" },
        { status: 400 }
      );
    }

    // Fetch group with astrologers
    // Group ID is BigInt in DB
    const group = await prisma.astrologer_groups.findFirst({
      where: { id: BigInt(groupId) },
      include: {
        astrologerassign: {
          include: {
            astrologer: {
              include: {
                users: {
                  select: {
                    id: true, // BigInt
                    name: true,
                    email: true,
                    contactNo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    // Extract and filter valid astrologers
    const astrologers = group.astrologerassign
      .map((a) => a.astrologer)
      .filter((a): a is NonNullable<typeof a> => a !== null && a.isActive === true && a.isDelete === false);

    return NextResponse.json({
      success: true,
      data: {
        groupId: group.id,
        groupName: group.name,
        totalAstrologers: astrologers.length,
        astrologers: astrologers.map((a) => ({
          id: a.id, // BigInt
          name: a.name,
          email: a.email,
          contactNo: a.contactNo,
          profileImage: a.profileImage,
          chatStatus: a.chatStatus,
          callStatus: a.callStatus,
          experienceInYears: a.experienceInYears,
          primarySkill: a.primarySkill,
          allSkill: a.allSkill,
          charge: a.charge,
        })),
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching group astrologers:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch astrologers" },
      { status: 500 }
    );
  }
}