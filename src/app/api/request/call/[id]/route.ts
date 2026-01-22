// ===================================
// FILE: app/api/request/call/[id]/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAssignmentMetadata } from "@/lib/requestAssignment";

// ✅ FIX: Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = parseInt(params.id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request ID",
        },
        { status: 400 }
      );
    }

    // Fetch call request
    // Note: callrequest.id is Int, but userId/astrologerId are BigInt
    const callRequest = await prisma.callrequest.findFirst({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true, // BigInt
            name: true,
            contactNo: true,
            email: true,
            birthDate: true,
            birthPlace: true,
            gender: true,
          },
        },
        astrologer: {
          select: {
            id: true, // BigInt
            name: true,
            email: true,
            contactNo: true,
            profileImage: true,
            experienceInYears: true,
            primarySkill: true,
          },
        },
      },
    });

    if (!callRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "Call request not found",
        },
        { status: 404 }
      );
    }

    // Get assignment metadata
    const metadata = await getAssignmentMetadata(requestId, "call");

    // Get assigned group details if exists
    let assignedGroup = null;
    if (metadata?.assigned_group_id) {
      assignedGroup = await prisma.astrologer_groups.findFirst({
        where: { id: BigInt(metadata.assigned_group_id) }, // Group ID is BigInt
        include: {
          astrologerassign: {
            include: {
              astrologer: {
                select: {
                  id: true, // BigInt
                  name: true,
                  profileImage: true,
                  chatStatus: true,
                  callStatus: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...callRequest,
        assignmentMetadata: metadata,
        assignedGroup,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching call request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch call request",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(requestId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request ID",
        },
        { status: 400 }
      );
    }

    // Check if request exists
    const exists = await prisma.callrequest.findFirst({
      where: { id: requestId },
    });

    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Call request not found",
        },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = ["callStatus"];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid fields to update",
        },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date();

    const updated = await prisma.callrequest.update({
      where: { id: requestId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Call request updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("❌ Error updating call request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update call request",
      },
      { status: 500 }
    );
  }
}