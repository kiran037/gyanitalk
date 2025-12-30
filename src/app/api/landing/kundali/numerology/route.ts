///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/numerology/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import axios from 'axios';
import { DateTime } from 'luxon';

let LANGUAGE = 'en';

const setLanguage = (lang: string) => {
  LANGUAGE = lang || 'en';
};

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
    // Check authentication (optional for numerology)
    const authHeader = request.headers.get('authorization');
    let userId: number | undefined;

    // TODO: Verify JWT if needed
    // if (authHeader) { userId = await verifyToken(authHeader); }

    const body = await request.json();
    let { day, month, year, name, language = 'en', id } = body;

    setLanguage(language);

    // ✅ FIX: Store numerology data in intakeform table since numerology table doesn't exist
    let numerologyRecord: any = null;

    if (id !== null && id !== undefined) {
      // Fetch existing record from intakeform
      numerologyRecord = await prisma.intakeform.findFirst({
        where: {
          id: Number(id),
          userId: userId || undefined
        }
      });

      if (!numerologyRecord) {
        return NextResponse.json({
          success: false,
          error: 'Numerology record not found'
        }, { status: 404 });
      }

      // Extract DOB
      const dobObj = new Date(numerologyRecord.birthDate);
      day = dobObj.getDate();
      month = dobObj.getMonth() + 1;
      year = dobObj.getFullYear();
      name = numerologyRecord.name;

    } else {
      // Validate inputs
      if (!day || !month || !year || !name) {
        return NextResponse.json({
          success: false,
          error: 'day, month, year, and name are required'
        }, { status: 400 });
      }

      // Create new record in intakeform table
      const dob = DateTime.fromObject(
        { day: Number(day), month: Number(month), year: Number(year) },
        { zone: 'Asia/Kolkata' }
      ).toJSDate();

      numerologyRecord = await prisma.intakeform.create({
        data: {
          userId: userId || null,
          name: name,
          phoneNumber: '', // Required field, default empty
          gender: 'other', // Required field, default
          birthDate: dob,
          birthTime: '00:00', // Required field, default
          birthPlace: '', // Required field, default
          maritalStatus: '', // Required field, default
          topicOfConcern: 'Numerology', // Required field
          latitude: '0',
          longitude: '0',
          timezone: '5.5'
        }
      });
    }

    // Prepare data for API
    const packageData = { day, month, year, name };

    // Fetch all numerology data
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

    return NextResponse.json({
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
      },
      message: 'Numerology data fetched successfully'
    });

  } catch (error: any) {
    console.error('Numerology error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch numerology data',
      message: error.message
    }, { status: 500 });
  }
}

// GET all numerology records for logged-in user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // TODO: Verify JWT
    const userId = 1; // Replace with actual auth

    // ✅ FIX: Fetch from intakeform where topicOfConcern is 'Numerology'
    const records = await prisma.intakeform.findMany({
      where: { 
        userId: userId,
        topicOfConcern: 'Numerology'
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: records
    });

  } catch (error: any) {
    console.error('Numerology list error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch numerology records',
      message: error.message
    }, { status: 500 });
  }
}