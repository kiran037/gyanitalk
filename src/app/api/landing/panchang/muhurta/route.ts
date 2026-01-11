import { NextRequest, NextResponse } from 'next/server';
import { VedicAPI, formatDateForAPI, getDefaultLocation } from '@/lib/panchang/vedic-api';

// Type for API response
interface VedicAPIResponse {
  status: number;
  response: any;
  remaining_api_calls: number;
}

// ============================================
// GET - Get muhurta data (hora or choghadiya)
// Query params: type=hora|choghadiya, date, lat, lon, tz, lang
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') || 'choghadiya'; // hora or choghadiya
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
      case 'hora':
        data = await VedicAPI.getHoraMuhurta({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      case 'choghadiya':
        data = await VedicAPI.getChoghadiyaMuhurta({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Must be: hora or choghadiya'
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
    console.error('Muhurta error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch muhurta data'
    }, { status: 500 });
  }
}

// ============================================
// POST - Get muhurta data with custom params
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type = 'choghadiya',
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

    let data: VedicAPIResponse;

    switch (type) {
      case 'hora':
        data = await VedicAPI.getHoraMuhurta({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      case 'choghadiya':
        data = await VedicAPI.getChoghadiyaMuhurta({
          date,
          ...location,
          time,
          lang
        }) as VedicAPIResponse;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Must be: hora or choghadiya'
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
    console.error('Muhurta POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch muhurta data'
    }, { status: 500 });
  }
}