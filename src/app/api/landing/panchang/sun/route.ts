import { NextRequest, NextResponse } from 'next/server';
import { VedicAPI, formatDateForAPI, getDefaultLocation } from '@/lib/panchang/vedic-api';

// Type for API response
interface VedicAPIResponse {
  status: number;
  response: any;
  remaining_api_calls: number;
}

// ============================================
// GET - Get sun data (rise, set, noon)
// Query params: type=rise|set|noon, date, lat, lon, tz, lang
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') || 'rise'; // rise, set, noon
    const dateParam = searchParams.get('date');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const tz = searchParams.get('tz');
    const time = searchParams.get('time') ?? undefined;
    const lang = searchParams.get('lang') || 'en';

    const date = dateParam || formatDateForAPI(new Date());
    const location = lat && lon && tz 
      ? { lat: parseFloat(lat), lon: parseFloat(lon), tz: parseFloat(tz) }
      : getDefaultLocation();

    let data: VedicAPIResponse;

    switch (type) {
      case 'rise':
        data = await VedicAPI.getSunrise({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      case 'set':
        data = await VedicAPI.getSunset({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      case 'noon':
        data = await VedicAPI.getSolarNoon({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Must be: rise, set, or noon'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      data: data.response,
      requestDate: date,
      location,
      remaining_api_calls: data.remaining_api_calls
    });

  } catch (error: any) {
    console.error('Sun data error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch sun data'
    }, { status: 500 });
  }
}

// ============================================
// POST - Get sun data with custom params
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type = 'rise',
      date, 
      lat, 
      lon, 
      tz = 5.5, 
      time = '10:40',
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

    let data: VedicAPIResponse;

    switch (type) {
      case 'rise':
        data = await VedicAPI.getSunrise({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      case 'set':
        data = await VedicAPI.getSunset({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      case 'noon':
        data = await VedicAPI.getSolarNoon({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Must be: rise, set, or noon'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      data: data.response,
      requestDate: date,
      location,
      remaining_api_calls: data.remaining_api_calls
    });

  } catch (error: any) {
    console.error('Sun data POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch sun data'
    }, { status: 500 });
  }
}