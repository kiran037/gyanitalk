// app/api/coupons/[id]/toggle-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH - Toggle coupon active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const couponId = BigInt(params.id);

    // Check if coupon exists
    const existingCoupon = await prisma.coupons.findUnique({
      where: { id: couponId },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Toggle the status
    const updatedCoupon = await prisma.coupons.update({
      where: { id: couponId },
      data: {
        is_active: !existingCoupon.is_active,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedCoupon,
        id: updatedCoupon.id.toString(),
      },
      message: `Coupon ${updatedCoupon.is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    console.error('Error toggling coupon status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to toggle coupon status' },
      { status: 500 }
    );
  }
}