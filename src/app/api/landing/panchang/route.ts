import { NextRequest, NextResponse } from 'next/server';
import { VedicAPI, formatDateForAPI, getDefaultLocation } from '@/lib/panchang/vedic-api';

// Type for API response
interface VedicAPIResponse {
  status: number;
  response: any;
  remaining_api_calls: number;
}

// ============================================
// GET - Get today's Panchang or specific date
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const dateParam = searchParams.get('date'); // DD/MM/YYYY format
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const tz = searchParams.get('tz');
    const time = searchParams.get('time') ?? undefined;
    const lang = searchParams.get('lang') || 'en';

    // Use provided location or default
    const location = lat && lon && tz 
      ? { lat: parseFloat(lat), lon: parseFloat(lon), tz: parseFloat(tz) }
      : getDefaultLocation();

    // Use provided date or today
    const date = dateParam || formatDateForAPI(new Date());

    // Fetch panchang data
    const data: VedicAPIResponse = await VedicAPI.getPanchang({
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
    console.error('Panchang GET error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch Panchang'
    }, { status: 500 });
  }
}

// ============================================
// POST - Get Panchang for specific date/location
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

    // Validate required fields
    if (!date) {
      return NextResponse.json({
        success: false,
        error: 'Date is required (format: DD/MM/YYYY)'
      }, { status: 400 });
    }

    // Use provided location or default
    const location = lat && lon 
      ? { lat: parseFloat(lat), lon: parseFloat(lon), tz: parseFloat(tz) }
      : getDefaultLocation();

    // Fetch panchang data
    const data: VedicAPIResponse = await VedicAPI.getPanchang({
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
    console.error('Panchang POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch Panchang'
    }, { status: 500 });
  }
}