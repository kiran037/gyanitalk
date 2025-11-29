import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const jsonStringifyWithBigInt = (payload: any) => {
  const replacer = (_key: string, value: any) => {
    if (typeof value === 'bigint') return value.toString();
    if (value instanceof Date) return value.toISOString();
    return value;
  };
  return JSON.stringify(payload, replacer);
};

// GET - List all coupons with pagination, filters, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Filters
    const type = searchParams.get('type'); // 'giftcard' | 'coupon'
    const discount_type = searchParams.get('discount_type'); // 'percentage' | 'fixed'
    const is_active = searchParams.get('is_active'); // 'true' | 'false'
    const status = searchParams.get('status'); // 'active' | 'expired' | 'upcoming'
    const search = searchParams.get('search'); // search by code or description
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause
    const where: any = {};
    
    if (type) where.type = type;
    if (discount_type) where.discount_type = discount_type;
    if (is_active !== null && is_active !== undefined) {
      where.is_active = is_active === 'true';
    }
    
    // Date filters
    const now = new Date();
    if (status === 'active') {
      where.is_active = true;
      where.OR = [
        { expiry_date: { gte: now } },
        { expiry_date: null }
      ];
      where.AND = [
        {
          OR: [
            { start_date: { lte: now } },
            { start_date: null }
          ]
        }
      ];
    } else if (status === 'expired') {
      where.expiry_date = { lt: now };
    } else if (status === 'upcoming') {
      where.start_date = { gt: now };
    }
    
    // Search
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch coupons with usage count
    const [coupons, total] = await Promise.all([
      prisma.coupons.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          coupon_user_usages: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.coupons.count({ where }),
    ]);

    // Format response with usage count and remove raw usages
    const formattedCoupons = coupons.map(coupon => {
      const c: any = { ...coupon };
      c.usage_count = (c.coupon_user_usages || []).length;
      delete c.coupon_user_usages; // remove raw array
      return c;
    });

    const payload = {
      success: true,
      data: formattedCoupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    const body = jsonStringifyWithBigInt(payload);
    return new NextResponse(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    const errBody = jsonStringifyWithBigInt({ success: false, error: error.message || 'Failed to fetch coupons' });
    return new NextResponse(errBody, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      code,
      description,
      discount_type,
      discount_value,
      max_discount,
      min_order_amount,
      usage_limit,
      usage_limit_per_user,
      start_date,
      expiry_date,
      type,
      is_active = true,
      auto_generate_code = false,
    } = body;

    // Validation
    if (!discount_type || !discount_value || !type) {
      const err = jsonStringifyWithBigInt({ success: false, error: 'Missing required fields' });
      return new NextResponse(err, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate discount_type enum
    if (!['percentage', 'fixed'].includes(discount_type)) {
      const err = jsonStringifyWithBigInt({ success: false, error: 'Invalid discount_type' });
      return new NextResponse(err, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate type enum
    if (!['giftcard', 'coupon'].includes(type)) {
      const err = jsonStringifyWithBigInt({ success: false, error: 'Invalid type' });
      return new NextResponse(err, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate dates
    if (start_date && expiry_date && new Date(start_date) >= new Date(expiry_date)) {
      const err = jsonStringifyWithBigInt({ success: false, error: 'Start date must be before expiry date' });
      return new NextResponse(err, { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Generate or validate code
    let finalCode = code;
    if (auto_generate_code || !code) {
      finalCode = `COUP${Date.now()}`.substring(0, 15);
    } else {
      // Check if code already exists
      const existing = await prisma.coupons.findUnique({
        where: { code: code.toUpperCase() },
      });
      
      if (existing) {
        const err = jsonStringifyWithBigInt({ success: false, error: 'Coupon code already exists' });
        return new NextResponse(err, { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Create coupon
    const coupon = await prisma.coupons.create({
      data: {
        code: finalCode.toUpperCase(),
        description,
        discount_type,
        discount_value,
        max_discount: max_discount || null,
        min_order_amount: min_order_amount || null,
        usage_limit: usage_limit || null,
        usage_limit_per_user: usage_limit_per_user || null,
        start_date: start_date ? new Date(start_date) : null,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        type,
        is_active,
      },
    });

    const payload = { success: true, data: coupon, message: 'Coupon created successfully' };
    const bodyResponse = jsonStringifyWithBigInt(payload);
    return new NextResponse(bodyResponse, { status: 201, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Error creating coupon:', error);
    const errBody = jsonStringifyWithBigInt({ success: false, error: error.message || 'Failed to create coupon' });
    return new NextResponse(errBody, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
