
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = await params;
    const id = BigInt(idStr);
    const { details } = await request.json();

    // Delete existing details
    await prisma.product_details.updateMany({
      where: { astromallProductId: id },
      data: { isDelete: 1 },
    });

    // Create new details
    const created = await prisma.product_details.createMany({
      data: details.map((detail: any) => ({
        astromallProductId: id,
        question: detail.question,
        answer: detail.answer,
        isActive: 1,
        isDelete: 0,
      })),
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}