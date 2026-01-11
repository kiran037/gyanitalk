///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/panchang/moon/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VedicAPI, formatDateForAPI, getDefaultLocation } from '@/lib/panchang/vedic-api';

// Type for API response
interface VedicAPIResponse {
  status: number;
  response: any;
  remaining_api_calls: number;
}

// ============================================
// GET - Get moon data (calendar, phase, rise, set)
// Query params: type=calendar|phase|rise|set, date, lat, lon, tz, lang
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') || 'phase'; // calendar, phase, rise, set
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
      case 'calendar':
        data = await VedicAPI.getMoonCalendar({
          date,
          tz: location.tz,
          lang
        }) as VedicAPIResponse;
        break;

      case 'phase':
        data = await VedicAPI.getMoonPhase({
          date,
          tz: location.tz,
          lang
        }) as VedicAPIResponse;
        break;

      case 'rise':
        data = await VedicAPI.getMoonrise({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      case 'set':
        data = await VedicAPI.getMoonset({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Must be: calendar, phase, rise, or set'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      data: data.response,
      requestDate: date,
      location: type === 'rise' || type === 'set' ? location : undefined,
      remaining_api_calls: data.remaining_api_calls
    });

  } catch (error: any) {
    console.error('Moon data error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch moon data'
    }, { status: 500 });
  }
}

// ============================================
// POST - Get moon data with custom params
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type = 'phase',
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
      case 'calendar':
        data = await VedicAPI.getMoonCalendar({
          date,
          tz: location.tz,
          lang
        }) as VedicAPIResponse;
        break;

      case 'phase':
        data = await VedicAPI.getMoonPhase({
          date,
          tz: location.tz,
          lang
        }) as VedicAPIResponse;
        break;

      case 'rise':
        data = await VedicAPI.getMoonrise({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      case 'set':
        data = await VedicAPI.getMoonset({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Must be: calendar, phase, rise, or set'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      data: data.response,
      requestDate: date,
      location: type === 'rise' || type === 'set' ? location : undefined,
      remaining_api_calls: data.remaining_api_calls
    });

  } catch (error: any) {
    console.error('Moon data POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch moon data'
    }, { status: 500 });
  }
}