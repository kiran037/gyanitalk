///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/price/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { KUNDLI_PRICING, MATCHING_PRICING } from '@/types/kundli';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        kundli: Object.values(KUNDLI_PRICING),
        matching: MATCHING_PRICING,
        currency: 'INR',
        freeLimit: {
          withoutLogin: 3,
          withLogin: 5,
          resetPeriod: '24 hours'
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pricing'
    }, { status: 500 });
  }
}