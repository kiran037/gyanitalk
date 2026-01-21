// ===================================
// FILE: app/api/request/chat/[id]/route.ts
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
        { success: false, error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Fetch chat request
    // Note: User and Astrologer IDs are BigInt
    const chatRequest = await prisma.chatrequest.findFirst({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
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
            id: true,
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

    if (!chatRequest) {
      return NextResponse.json(
        { success: false, error: "Chat request not found" },
        { status: 404 }
      );
    }

    const metadata = await getAssignmentMetadata(requestId, "chat");

    let assignedGroup = null;
    if (metadata?.assigned_group_id) {
      // Group ID is BigInt in schema
      assignedGroup = await prisma.astrologer_groups.findFirst({
        where: { id: BigInt(metadata.assigned_group_id) },
        include: {
          astrologerassign: {
            include: {
              astrologer: {
                select: {
                  id: true,
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
        ...chatRequest,
        assignmentMetadata: metadata,
        assignedGroup,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching chat request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch chat request" },
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
        { success: false, error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const exists = await prisma.chatrequest.findFirst({
      where: { id: requestId },
    });

    if (!exists) {
      return NextResponse.json(
        { success: false, error: "Chat request not found" },
        { status: 404 }
      );
    }

    const allowedFields = ["chatStatus"];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date();

    const updated = await prisma.chatrequest.update({
      where: { id: requestId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Chat request updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("❌ Error updating chat request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update chat request" },
      { status: 500 }
    );
  }
}