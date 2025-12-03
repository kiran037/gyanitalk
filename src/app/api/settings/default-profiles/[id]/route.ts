// app/api/settings/default-profiles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single default profile
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await prisma.defaultprofile.findFirst({
      where: { 
        id: parseInt(params.id),
        isDelete: false 
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Default profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Error fetching default profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch default profile' },
      { status: 500 }
    );
  }
}

// PUT - Update default profile
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, profile, isActive } = body;

    // Check if exists
    const existing = await prisma.defaultprofile.findFirst({
      where: { 
        id: parseInt(params.id),
        isDelete: false 
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Default profile not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.defaultprofile.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(profile && { profile }),
        ...(isActive !== undefined && { isActive }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Default profile updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating default profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update default profile' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete default profile
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.defaultprofile.findFirst({
      where: { 
        id: parseInt(params.id),
        isDelete: false 
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Default profile not found' },
        { status: 404 }
      );
    }

    await prisma.defaultprofile.update({
      where: { id: parseInt(params.id) },
      data: {
        isDelete: true,
        isActive: false,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Default profile deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting default profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete default profile' },
      { status: 500 }
    );
  }
}