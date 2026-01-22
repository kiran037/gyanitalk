
import { NextRequest, NextResponse } from 'next/server';
import { VedicGenAPI } from '@/lib/kundli/vedic-gen-api';
import { APIError } from '@/lib/error-response';
import { formatDateForAPI } from '@/lib/date-formatter';

// Helper: convert BigInt / Decimal / Date -> JSON-safe
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (typeof obj === "object" && (obj as any).constructor?.name === "Decimal") {
    return Number((obj as any).toString());
  }
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

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

    if (!birthDate || !birthTime || !latitude || !longitude || !timezone) {
      return APIError.badRequest('Missing required fields');
    }

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

    const isAshtakvargaChart = planet && planet !== 'total';
    let chartData;
    
    // Now that the method exists on the class, we can call it directly
    if (isAshtakvargaChart) {
      chartData = await VedicGenAPI.getAshtakvargaChartImage({ ...apiParams, planet });
    } else {
      chartData = await VedicGenAPI.getChartImage(apiParams);
    }

    // Logic to extract SVG from V3 Response
    let chartHtml = null;

    if (chartData) {
      if (typeof chartData === 'string') {
        chartHtml = chartData;
      } else if (typeof chartData.response === 'string') {
        chartHtml = chartData.response;
      } else if (chartData.svg) {
        chartHtml = chartData.svg;
      }
    }

    if (!chartHtml || typeof chartHtml !== 'string') {
      console.error('Chart API Error:', chartData);
      return NextResponse.json({
        success: false,
        error: 'Chart generation failed - invalid response from provider'
      }, { status: 500 });
    }

    const isSVG = chartHtml.trim().startsWith('<') || chartHtml.includes('<svg');

    const response = {
      success: true,
      data: {
        chart: chartHtml,
        chartType: div,
        style,
        planet: isAshtakvargaChart ? planet : null,
        format: isSVG ? 'svg' : 'text'
      },
      message: `${div} chart generated successfully`
    };

    return NextResponse.json(convertPrismaTypes(response));

  } catch (error: any) {
    console.error('Chart error:', error);
    return APIError.internalError('Failed to generate chart');
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

  return NextResponse.json({ success: true, data: chartTypes });
}