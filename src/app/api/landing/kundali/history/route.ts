import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactNo = searchParams.get('contactNo');
    const userId = searchParams.get('userId');

    if (!contactNo && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Contact number or user ID required'
      }, { status: 400 });
    }

    let whereClause: any = {};
    
    if (userId) {
      whereClause.createdBy = parseInt(userId);
    } else if (contactNo) {
      // Find user by contact number first
      const user = await prisma.users.findFirst({
        where: { contactNo }
      });

      if (!user) {
        return NextResponse.json({
          success: true,
          data: []
        });
      }

      whereClause.createdBy = Number(user.id);
    }

    // Fetch user's kundlis
    const kundalis = await prisma.kundalis.findMany({
      where: {
        ...whereClause,
        isActive: true,
        isDelete: false
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10 // Last 10 kundlis
    });

    // Format the data
    const formattedKundalis = kundalis.map(k => ({
      id: Number(k.id),
      name: k.name,
      gender: k.gender,
      birthDate: k.birthDate.toISOString().split('T')[0],
      birthTime: k.birthTime,
      birthPlace: k.birthPlace,
      latitude: k.latitude,
      longitude: k.longitude,
      timezone: k.timezone,
      pdfType: k.pdf_type,
      pdfLink: k.pdf_link,
      createdAt: k.created_at?.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedKundalis
    });

  } catch (error: any) {
    console.error('Kundli history fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch kundli history',
      message: error.message
    }, { status: 500 });
  }
}