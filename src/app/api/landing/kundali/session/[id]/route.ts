///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/session/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kundaliId = parseInt(params.id);

    if (isNaN(kundaliId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid kundali ID'
      }, { status: 400 });
    }

    const kundali = await prisma.kundalis.findUnique({
      where: { id: BigInt(kundaliId) }
    });

    if (!kundali) {
      return NextResponse.json({
        success: false,
        error: 'Kundali not found'
      }, { status: 404 });
    }

    // Convert BigInt to number for JSON serialization
    const kundaliData = {
      ...kundali,
      id: Number(kundali.id),
      birthDate: kundali.birthDate.toISOString().split('T')[0]
    };

    return NextResponse.json({
      success: true,
      data: kundaliData
    });

  } catch (error: any) {
    console.error('Kundali retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve kundali',
      message: error.message
    }, { status: 500 });
  }
}