// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Validate coupon code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, orderAmount, type } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Find coupon by code
    const coupon = await prisma.coupons.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        coupon_user_usages: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: 'Invalid coupon code',
        },
        { status: 404 }
      );
    }

    // Validation checks
    const validationErrors: string[] = [];
    const now = new Date();

    // Check if active
    if (!coupon.is_active) {
      validationErrors.push('This coupon is currently inactive');
    }

    // Check start date
    if (coupon.start_date && coupon.start_date > now) {
      validationErrors.push(
        `This coupon will be valid from ${coupon.start_date.toLocaleDateString()}`
      );
    }

    // Check expiry date
    if (coupon.expiry_date && coupon.expiry_date < now) {
      validationErrors.push('This coupon has expired');
    }

    // Check type match
    if (type && coupon.type !== type) {
      validationErrors.push(`This coupon is only valid for ${coupon.type}`);
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.coupon_user_usages.length >= coupon.usage_limit) {
      validationErrors.push('This coupon has reached its usage limit');
    }

    // Check user-specific usage limit
    if (userId && coupon.usage_limit_per_user) {
      const userUsageCount = coupon.coupon_user_usages.filter(
        (usage) => usage.userId.toString() === userId.toString()
      ).length;

      if (userUsageCount >= coupon.usage_limit_per_user) {
        validationErrors.push(
          `You have already used this coupon ${userUsageCount} time(s). Maximum allowed: ${coupon.usage_limit_per_user}`
        );
      }
    }

    // Check minimum order amount
    if (orderAmount && coupon.min_order_amount) {
      const minAmount = parseFloat(coupon.min_order_amount.toString());
      if (orderAmount < minAmount) {
        validationErrors.push(
          `Minimum order amount of ₹${minAmount} required to use this coupon`
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (orderAmount && validationErrors.length === 0) {
      if (coupon.discount_type === 'percentage') {
        discountAmount = (orderAmount * parseFloat(coupon.discount_value.toString())) / 100;
        
        // Apply max discount if set
        if (coupon.max_discount) {
          const maxDiscount = parseFloat(coupon.max_discount.toString());
          discountAmount = Math.min(discountAmount, maxDiscount);
        }
      } else if (coupon.discount_type === 'fixed') {
        discountAmount = parseFloat(coupon.discount_value.toString());
      }

      // Ensure discount doesn't exceed order amount
      discountAmount = Math.min(discountAmount, orderAmount);
    }

    const isValid = validationErrors.length === 0;

    return NextResponse.json({
      success: true,
      valid: isValid,
      data: isValid
        ? {
            coupon: {
              id: coupon.id.toString(),
              code: coupon.code,
              description: coupon.description,
              discount_type: coupon.discount_type,
              discount_value: coupon.discount_value,
              max_discount: coupon.max_discount,
              type: coupon.type,
            },
            discount: {
              amount: discountAmount,
              finalAmount: orderAmount ? orderAmount - discountAmount : null,
            },
            usage: {
              total: coupon.coupon_user_usages.length,
              limit: coupon.usage_limit,
              remaining: coupon.usage_limit
                ? coupon.usage_limit - coupon.coupon_user_usages.length
                : null,
            },
          }
        : null,
      errors: validationErrors,
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}