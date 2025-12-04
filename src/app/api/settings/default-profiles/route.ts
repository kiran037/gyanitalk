// app/api/settings/default-profiles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all default profiles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where = activeOnly ? { isActive: true, isDelete: false } : { isDelete: false };

    const profiles = await prisma.defaultprofile.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: profiles,
      total: profiles.length,
    });
  } catch (error: any) {
    console.error('Error fetching default profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch default profiles' },
      { status: 500 }
    );
  }
}

// POST - Create new default profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, profile, isActive } = body;

    // Validation
    if (!name || !profile) {
      return NextResponse.json(
        { success: false, error: 'Name and profile image are required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await prisma.defaultprofile.findFirst({
      where: { 
        name: name.trim(),
        isDelete: false 
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This profile name already exists' },
        { status: 409 }
      );
    }

    const newProfile = await prisma.defaultprofile.create({
      data: {
        name: name.trim(),
        profile,
        isActive: isActive !== undefined ? isActive : true,
        isDelete: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Default profile created successfully',
        data: newProfile,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating default profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create default profile' },
      { status: 500 }
    );
  }
}