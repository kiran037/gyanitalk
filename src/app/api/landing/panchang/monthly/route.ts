import { NextRequest, NextResponse } from 'next/server';
import { VedicAPI, formatDateForAPI, getDefaultLocation } from '@/lib/panchang/vedic-api';

// Type for API response
interface VedicAPIResponse {
  status: number;
  response: any;
  remaining_api_calls: number;
}

// ============================================
// GET - Get monthly Panchang for current month or specific month
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const dateParam = searchParams.get('date'); // Any date in the month (DD/MM/YYYY)
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const tz = searchParams.get('tz');
    const time = searchParams.get('time') ?? undefined;
    const lang = searchParams.get('lang') || 'en';

    const location = lat && lon && tz 
      ? { lat: parseFloat(lat), lon: parseFloat(lon), tz: parseFloat(tz) }
      : getDefaultLocation();

    // Use first day of current month or provided date
    const date = dateParam || formatDateForAPI(new Date());

    const data: VedicAPIResponse = await VedicAPI.getMonthlyPanchang({
      date,
      ...location,
      time,
      lang
    }) as VedicAPIResponse;

    return NextResponse.json({
      success: true,
      data: data.response,
      requestDate: date,
      location,
      remaining_api_calls: data.remaining_api_calls
    });

  } catch (error: any) {
    console.error('Monthly Panchang error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch monthly Panchang'
    }, { status: 500 });
  }
}

// ============================================
// POST - Get monthly Panchang with custom params
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      date, 
      lat, 
      lon, 
      tz = 5.5, 
      time = '05:20',
      lang = 'en' 
    } = body;

    if (!date) {
      return NextResponse.json({
        success: false,
        error: 'Date is required (format: DD/MM/YYYY)'
      }, { status: 400 });
    }

    const location = lat && lon 
      ? { lat: parseFloat(lat), lon: parseFloat(lon), tz: parseFloat(tz) }
      : getDefaultLocation();

    const data: VedicAPIResponse = await VedicAPI.getMonthlyPanchang({
      date,
      ...location,
      time,
      lang
    }) as VedicAPIResponse;

    return NextResponse.json({
      success: true,
      data: data.response,
      requestDate: date,
      location,
      remaining_api_calls: data.remaining_api_calls
    });

  } catch (error: any) {
    console.error('Monthly Panchang POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch monthly Panchang'
    }, { status: 500 });
  }
}