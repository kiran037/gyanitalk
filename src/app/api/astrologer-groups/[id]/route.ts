// app/api/astrologer-groups/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get Group Details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = BigInt(params.id);

    const group = await prisma.astrologer_groups.findUnique({
      where: { id: groupId },
      include: {
        astrologerassign: {
          include: {
            astrologer: {
              select: {
                id: true,
                name: true,
                email: true,
                contactNo: true,
                profileImage: true,
                primarySkill: true,
                allSkill: true,
                languageKnown: true,
                experienceInYears: true,
                charge: true,
                isVerified: true,
                isActive: true,
                chatStatus: true,
                callStatus: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...group,
        memberCount: group.astrologerassign.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching group details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch group details',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH - Update Group
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = BigInt(params.id);
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Group name is required',
        },
        { status: 400 }
      );
    }

    const updatedGroup = await prisma.astrologer_groups.update({
      where: { id: groupId },
      data: {
        name,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Group updated successfully',
      data: updatedGroup,
    });
  } catch (error: any) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update group',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete Group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = BigInt(params.id);

    // First delete all astrologer assignments
    await prisma.astrologer_assign_group.deleteMany({
      where: { group_id: groupId },
    });

    // Then delete the group
    await prisma.astrologer_groups.delete({
      where: { id: groupId },
    });

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete group',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}