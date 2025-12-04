// app/api/coupons/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get single coupon details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const couponId = BigInt(params.id);

    const coupon = await prisma.coupons.findUnique({
      where: { id: couponId },
      include: {
        coupon_user_usages: {
          select: {
            id: true,
            userId: true,
            used_at: true,
            amt: true,
            users: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            used_at: 'desc',
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const stats = {
      total_usage: coupon.coupon_user_usages.length,
      total_discount_given: coupon.coupon_user_usages.reduce(
        (sum, usage) => sum + (usage.amt || 0),
        0
      ),
      unique_users: new Set(coupon.coupon_user_usages.map(u => u.userId)).size,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...coupon,
        id: coupon.id.toString(), // Convert BigInt to string
        stats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch coupon' },
      { status: 500 }
    );
  }
}

// PATCH - Update coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const couponId = BigInt(params.id);
    const body = await request.json();

    // Check if coupon exists
    const existingCoupon = await prisma.coupons.findUnique({
      where: { id: couponId },
      include: {
        coupon_user_usages: true,
      },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Prevent editing code if coupon has been used
    if (body.code && body.code !== existingCoupon.code && existingCoupon.coupon_user_usages.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot change code of a used coupon' },
        { status: 400 }
      );
    }

    // If code is being changed, check for duplicates
    if (body.code && body.code !== existingCoupon.code) {
      const duplicate = await prisma.coupons.findUnique({
        where: { code: body.code.toUpperCase() },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'Coupon code already exists' },
          { status: 400 }
        );
      }
    }

    // Validate dates if provided
    const startDate = body.start_date ? new Date(body.start_date) : existingCoupon.start_date;
    const expiryDate = body.expiry_date ? new Date(body.expiry_date) : existingCoupon.expiry_date;

    if (startDate && expiryDate && startDate >= expiryDate) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before expiry date' },
        { status: 400 }
      );
    }

    // Validate enums if provided
    if (body.discount_type && !['percentage', 'fixed'].includes(body.discount_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid discount_type' },
        { status: 400 }
      );
    }

    if (body.type && !['giftcard', 'coupon'].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type' },
        { status: 400 }
      );
    }

    // Update coupon
    const updateData: any = {};
    
    if (body.code) updateData.code = body.code.toUpperCase();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.discount_type) updateData.discount_type = body.discount_type;
    if (body.discount_value !== undefined) updateData.discount_value = body.discount_value;
    if (body.max_discount !== undefined) updateData.max_discount = body.max_discount;
    if (body.min_order_amount !== undefined) updateData.min_order_amount = body.min_order_amount;
    if (body.usage_limit !== undefined) updateData.usage_limit = body.usage_limit;
    if (body.usage_limit_per_user !== undefined) updateData.usage_limit_per_user = body.usage_limit_per_user;
    if (body.start_date !== undefined) updateData.start_date = body.start_date ? new Date(body.start_date) : null;
    if (body.expiry_date !== undefined) updateData.expiry_date = body.expiry_date ? new Date(body.expiry_date) : null;
    if (body.type) updateData.type = body.type;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const updatedCoupon = await prisma.coupons.update({
      where: { id: couponId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedCoupon,
        id: updatedCoupon.id.toString(),
      },
      message: 'Coupon updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const couponId = BigInt(params.id);

    // Check if coupon exists
    const existingCoupon = await prisma.coupons.findUnique({
      where: { id: couponId },
      include: {
        coupon_user_usages: true,
      },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check if coupon has been used
    if (existingCoupon.coupon_user_usages.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete a coupon that has been used. Consider deactivating it instead.',
          usage_count: existingCoupon.coupon_user_usages.length,
        },
        { status: 400 }
      );
    }

    // Delete coupon
    await prisma.coupons.delete({
      where: { id: couponId },
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}