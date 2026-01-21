

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date -> JSON-safe
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (typeof obj === "object" && (obj as any).constructor?.name === "Decimal") {
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
      const user = await prisma.users.findFirst({
        where: { contactNo }
      });

      if (!user) {
        return NextResponse.json({ success: true, data: [] });
      }
      whereClause.createdBy = BigInt(user.id);
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
      take: 10
    });

    // Use converter for safety
    return NextResponse.json(convertPrismaTypes({
      success: true,
      data: kundalis
    }));

  } catch (error: any) {
    console.error('Kundli history fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch kundli history',
      message: error.message
    }, { status: 500 });
  }
}