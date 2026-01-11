import { NextRequest, NextResponse } from 'next/server';
import { VedicAPI } from '@/lib/panchang/vedic-api';

// Type for API response
interface VedicAPIResponse {
  status: number;
  response: any;
  remaining_api_calls: number;
}

// ============================================
// GET - Get planetary data (retrogrades or transits)
// Query params: type=retrogrades|transits, year, planet, lang
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') || 'transits'; // retrogrades or transits
    const yearParam = searchParams.get('year');
    const planet = searchParams.get('planet'); // For retrogrades: Mercury, Venus, Mars, Jupiter, Saturn
    const lang = searchParams.get('lang') || 'en';

    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    let data: VedicAPIResponse;

    switch (type) {
      case 'retrogrades':
        if (!planet) {
          return NextResponse.json({
            success: false,
            error: 'Planet name is required for retrogrades (Mercury, Venus, Mars, Jupiter, Saturn)'
          }, { status: 400 });
        }

        // Validate planet name
        const validPlanets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        if (!validPlanets.includes(planet)) {
          return NextResponse.json({
            success: false,
            error: `Invalid planet. Must be one of: ${validPlanets.join(', ')}`
          }, { status: 400 });
        }

        data = await VedicAPI.getRetrogrades({
          year,
          planet,
          lang
        }) as VedicAPIResponse;
        break;

      case 'transits':
        data = await VedicAPI.getPlanetaryTransits({
          year,
          lang
        }) as VedicAPIResponse;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Must be: retrogrades or transits'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      year,
      planet: type === 'retrogrades' ? planet : undefined,
      data: data.response,
      remaining_api_calls: data.remaining_api_calls
    });

  } catch (error: any) {
    console.error('Planetary data error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch planetary data'
    }, { status: 500 });
  }
}

// ============================================
// POST - Get planetary data with custom params
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type = 'transits',
      year,
      planet,
      lang = 'en' 
    } = body;

    const targetYear = year || new Date().getFullYear();

    let data: VedicAPIResponse;

    switch (type) {
      case 'retrogrades':
        if (!planet) {
          return NextResponse.json({
            success: false,
            error: 'Planet name is required for retrogrades'
          }, { status: 400 });
        }

        const validPlanets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        if (!validPlanets.includes(planet)) {
          return NextResponse.json({
            success: false,
            error: `Invalid planet. Must be one of: ${validPlanets.join(', ')}`
          }, { status: 400 });
        }

        data = await VedicAPI.getRetrogrades({
          year: targetYear,
          planet,
          lang
        }) as VedicAPIResponse;
        break;

      case 'transits':
        data = await VedicAPI.getPlanetaryTransits({
          year: targetYear,
          lang
        }) as VedicAPIResponse;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Must be: retrogrades or transits'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      year: targetYear,
      planet: type === 'retrogrades' ? planet : undefined,
      data: data.response,
      remaining_api_calls: data.remaining_api_calls
    });

  } catch (error: any) {
    console.error('Planetary data POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch planetary data'
    }, { status: 500 });
  }
}