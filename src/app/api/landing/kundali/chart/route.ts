// /api/landing/kundali/chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VedicGenAPI } from '@/lib/kundli/vedic-gen-api';
import { APIError } from '@/lib/error-response';
import { formatDateForAPI } from '@/lib/date-formatter';

/**
 * POST /api/landing/kundali/chart
 * Generate specific chart (D1, D9, etc.) on demand
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      birthDate, 
      birthTime, 
      latitude, 
      longitude, 
      timezone,
      div = 'D1',
      style = 'north',
      language = 'en',
      planet = 'total'
    } = body;

    // Basic validation
    if (!birthDate || !birthTime || !latitude || !longitude || !timezone) {
      return APIError.badRequest('Missing required fields');
    }

    console.log(`🎨 Generating ${div} chart in ${style} style`);

    // CRITICAL: Convert timezone to string
    const timezoneStr = typeof timezone === 'number' ? timezone.toString() : timezone;

    const apiParams = {
      dob: formatDateForAPI(birthDate),
      tob: birthTime,
      lat: parseFloat(latitude),
      lon: parseFloat(longitude),
      tz: timezoneStr,
      lang: language,
      div,
      style
    };

    console.log('📤 API params:', apiParams);

    const isAshtakvargaChart = planet && planet !== 'total';
    let chartData;
    
    if (isAshtakvargaChart) {
      chartData = await VedicGenAPI.getAshtakvargaChartImage({ ...apiParams, planet });
    } else {
      chartData = await VedicGenAPI.getChartImage(apiParams);
    }

    console.log('📥 API response type:', typeof chartData);
    console.log('📥 API response keys:', chartData ? Object.keys(chartData) : 'null');

    // CRITICAL FIX: The VedicAstro API returns the SVG directly in response.response
    // which is a STRING (the SVG XML), not an object
    let chartHtml = null;

    if (chartData && chartData.response) {
      // The response.response field IS the SVG string itself
      if (typeof chartData.response === 'string') {
        chartHtml = chartData.response;
      } else if (typeof chartData.response.response === 'string') {
        chartHtml = chartData.response.response;
      } else if (chartData.response.chart) {
        chartHtml = chartData.response.chart;
      } else if (chartData.response.svg) {
        chartHtml = chartData.response.svg;
      }
    }

    // Fallback: check if chartData itself is a string (unlikely but possible)
    if (!chartHtml && typeof chartData === 'string') {
      chartHtml = chartData;
    }

    if (!chartHtml || typeof chartHtml !== 'string' || chartHtml.length === 0) {
      console.error('❌ No valid chart data found');
      console.error('Response structure:', JSON.stringify(chartData, null, 2).substring(0, 500));
      
      return NextResponse.json({
        success: false,
        error: 'Chart generation failed - no SVG data in response',
        debug: process.env.NODE_ENV === 'development' ? {
          responseType: typeof chartData,
          hasResponse: !!chartData?.response,
          responseType2: typeof chartData?.response,
          sampleData: typeof chartData === 'object' ? Object.keys(chartData).slice(0, 10) : 'not object'
        } : undefined
      }, { status: 500 });
    }

    // Verify it's actually SVG
    const isSVG = chartHtml.trim().startsWith('<') || chartHtml.includes('<svg');
    
    console.log(`✅ Chart generated! Length: ${chartHtml.length}, Is SVG: ${isSVG}`);

    return NextResponse.json({
      success: true,
      data: {
        chart: chartHtml,
        chartType: div,
        style,
        planet: isAshtakvargaChart ? planet : null,
        format: isSVG ? 'svg' : 'text'
      },
      message: `${div} chart generated successfully`
    });

  } catch (error: any) {
    console.error('❌ Chart generation error:', error);
    return APIError.internalError(
      'Failed to generate chart',
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
}

export async function GET(request: NextRequest) {
  const chartTypes = {
    divisional: [
      { code: 'D1', name: 'Rasi Chart', description: 'Main birth chart' },
      { code: 'D2', name: 'Hora Chart', description: 'Wealth and prosperity' },
      { code: 'D3', name: 'Drekkana Chart', description: 'Siblings and courage' },
      { code: 'D4', name: 'Chaturthamsa Chart', description: 'Property and assets' },
      { code: 'D7', name: 'Saptamsa Chart', description: 'Children and progeny' },
      { code: 'D9', name: 'Navamsa Chart', description: 'Marriage and dharma' },
      { code: 'D10', name: 'Dasamsa Chart', description: 'Career and profession' },
      { code: 'D12', name: 'Dwadasamsa Chart', description: 'Parents' },
      { code: 'D16', name: 'Shodasamsa Chart', description: 'Vehicles and comforts' },
      { code: 'D20', name: 'Vimsamsa Chart', description: 'Spiritual progress' },
      { code: 'D24', name: 'Chaturvimsamsa Chart', description: 'Education and learning' },
      { code: 'D27', name: 'Nakshatramsa Chart', description: 'Strengths and weaknesses' },
      { code: 'D30', name: 'Trisamsa Chart', description: 'Misfortunes and evils' },
      { code: 'D40', name: 'Khavedamsa Chart', description: 'Auspicious effects' },
      { code: 'D45', name: 'Akshavedamsa Chart', description: 'General indications' },
      { code: 'D60', name: 'Shashtiamsa Chart', description: 'Past life karma' }
    ],
    styles: [
      { code: 'north', name: 'North Indian Style', description: 'Fixed houses, moving signs' },
      { code: 'south', name: 'South Indian Style', description: 'Fixed signs, moving houses' }
    ]
  };

  return NextResponse.json({
    success: true,
    data: chartTypes,
    message: 'Available chart types'
  });
}