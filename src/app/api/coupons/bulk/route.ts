// app/api/coupons/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Bulk operations on coupons
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, couponIds } = body;

    if (!action || !couponIds || !Array.isArray(couponIds)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request. Action and couponIds array are required' 
        },
        { status: 400 }
      );
    }

    if (couponIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No coupon IDs provided' },
        { status: 400 }
      );
    }

    // Convert string IDs to BigInt
    const bigIntIds = couponIds.map((id: string | number) => BigInt(id));

    let result;
    let message = '';

    switch (action) {
      case 'activate':
        result = await prisma.coupons.updateMany({
          where: { id: { in: bigIntIds } },
          data: { is_active: true },
        });
        message = `${result.count} coupon(s) activated successfully`;
        break;

      case 'deactivate':
        result = await prisma.coupons.updateMany({
          where: { id: { in: bigIntIds } },
          data: { is_active: false },
        });
        message = `${result.count} coupon(s) deactivated successfully`;
        break;

      case 'delete':
        // Check if any coupons have been used
        const couponsWithUsage = await prisma.coupons.findMany({
          where: { 
            id: { in: bigIntIds },
          },
          include: {
            coupon_user_usages: {
              select: { id: true },
            },
          },
        });

        const usedCoupons = couponsWithUsage.filter(
          c => c.coupon_user_usages.length > 0
        );

        if (usedCoupons.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot delete coupons that have been used`,
              usedCoupons: usedCoupons.map(c => ({
                id: c.id.toString(),
                code: c.code,
                usageCount: c.coupon_user_usages.length,
              })),
            },
            { status: 400 }
          );
        }

        // Delete unused coupons
        const unusedIds = couponsWithUsage
          .filter(c => c.coupon_user_usages.length === 0)
          .map(c => c.id);

        result = await prisma.coupons.deleteMany({
          where: { id: { in: unusedIds } },
        });
        message = `${result.count} coupon(s) deleted successfully`;
        break;

      case 'extend':
        // Extend expiry date by X days
        const { days = 30 } = body;
        
        const couponsToExtend = await prisma.coupons.findMany({
          where: { id: { in: bigIntIds } },
        });

        const updatePromises = couponsToExtend.map(coupon => {
          const newExpiryDate = new Date(coupon.expiry_date || new Date());
          newExpiryDate.setDate(newExpiryDate.getDate() + days);

          return prisma.coupons.update({
            where: { id: coupon.id },
            data: { expiry_date: newExpiryDate },
          });
        });

        await Promise.all(updatePromises);
        message = `Extended expiry date of ${couponsToExtend.length} coupon(s) by ${days} days`;
        result = { count: couponsToExtend.length };
        break;

      case 'update-discount':
        // Bulk update discount value
        const { discount_value, discount_type } = body;
        
        if (!discount_value) {
          return NextResponse.json(
            { success: false, error: 'discount_value is required for update-discount action' },
            { status: 400 }
          );
        }

        const updateData: any = { discount_value };
        if (discount_type) {
          if (!['percentage', 'fixed'].includes(discount_type)) {
            return NextResponse.json(
              { success: false, error: 'Invalid discount_type' },
              { status: 400 }
            );
          }
          updateData.discount_type = discount_type;
        }

        result = await prisma.coupons.updateMany({
          where: { id: { in: bigIntIds } },
          data: updateData,
        });
        message = `Updated discount for ${result.count} coupon(s)`;
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Invalid action: ${action}. Allowed: activate, deactivate, delete, extend, update-discount` 
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      affected: result.count,
    });
  } catch (error: any) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}