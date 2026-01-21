
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import axios from 'axios';
import { DateTime } from 'luxon';

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

let LANGUAGE = 'en';

const getResponse = async (resource: string, data: any) => {
  try {
    const response = await axios.post(
      `${process.env.ASTROLOGYAPI_BASE_URL || 'http://json.astrologyapi.com/v1'}/${resource}/`,
      new URLSearchParams(data).toString(),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            `${process.env.ASTROLOGYAPI_USER_ID}:${process.env.ASTROLOGYAPI_API_KEY}`
          ).toString('base64'),
          'Accept-Language': LANGUAGE,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`Numerology API error on ${resource}:`, error?.response?.data || error.message);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { day, month, year, name, language = 'en', id, userId } = body;
    LANGUAGE = language;

    let numerologyRecord: any = null;

    if (id) {
      // Fetch existing
      numerologyRecord = await prisma.intakeform.findFirst({
        where: {
          id: Number(id),
          // Add userId check if provided
          ...(userId && { userId: Number(userId) })
        }
      });

      if (!numerologyRecord) {
        return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
      }

      const dobObj = new Date(numerologyRecord.birthDate);
      day = dobObj.getDate();
      month = dobObj.getMonth() + 1;
      year = dobObj.getFullYear();
      name = numerologyRecord.name;

    } else {
      if (!day || !month || !year || !name) {
        return NextResponse.json({ success: false, error: 'Required fields missing' }, { status: 400 });
      }

      // Store in intakeform
      const dob = DateTime.fromObject({ day, month, year }, { zone: 'Asia/Kolkata' }).toJSDate();

      numerologyRecord = await prisma.intakeform.create({
        data: {
          userId: userId ? Number(userId) : null,
          name: name,
          phoneNumber: '',
          gender: 'other',
          birthDate: dob,
          birthTime: '00:00',
          birthPlace: 'Unknown',
          maritalStatus: 'Single',
          topicOfConcern: 'Numerology',
          latitude: '0',
          longitude: '0',
          timezone: '5.5'
        }
      });
    }

    const packageData = { day, month, year, name };

    const [
      table,
      numero_rep,
      fav_time,
      placevastu,
      fast_report,
      fav_lord,
      fav_mantra
    ] = await Promise.all([
      getResponse('numero_table', packageData),
      getResponse('numero_report', packageData),
      getResponse('numero_fav_time', packageData),
      getResponse('numero_place_vastu', packageData),
      getResponse('numero_fasts_report', packageData),
      getResponse('numero_fav_lord', packageData),
      getResponse('numero_fav_mantra', packageData)
    ]);

    const response = {
      success: true,
      data: {
        numerologyId: numerologyRecord.id,
        table,
        report: numero_rep,
        favorableTime: fav_time,
        placeVastu: placevastu,
        fastsReport: fast_report,
        favoriteLord: fav_lord,
        favoriteMantra: fav_mantra
      }
    };

    return NextResponse.json(convertPrismaTypes(response));

  } catch (error: any) {
    console.error('Numerology error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Pass userId via query param if needed for testing

    // Use hardcoded test ID if no auth yet, or integrate your getSession here
    const effectiveUserId = userId ? parseInt(userId) : 1; 

    const records = await prisma.intakeform.findMany({
      where: { 
        userId: effectiveUserId,
        topicOfConcern: 'Numerology'
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(convertPrismaTypes({
      success: true,
      data: records
    }));

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}