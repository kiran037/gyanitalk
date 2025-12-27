///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/chart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VedicAPI } from '@/lib/kundli/vedic-api';
import { Validator } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      birthDate, 
      birthTime, 
      latitude, 
      longitude, 
      timezone,
      div = 'D1', // Chart type: D1 (Rasi), D9 (Navamsa), etc.
      style = 'north', // north or south
      language = 'en'
    } = body;

    // Basic validation
    if (!birthDate || !birthTime || !latitude || !longitude || !timezone) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Format date
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const chartData = await VedicAPI.getChartImage({
      dob: formatDate(birthDate),
      tob: birthTime,
      lat: parseFloat(latitude),
      lon: parseFloat(longitude),
      tz: timezone,
      lang: language,
      div,
      style
    });

    return NextResponse.json({
      success: true,
      data: {
        chart: chartData.response?.svg || chartData.response?.image_url,
        chartType: div,
        style
      }
    });

  } catch (error: any) {
    console.error('Chart generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate chart',
      message: error.message
    }, { status: 500 });
  }
}