

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { day, month, year, language = 'en', latitude = 28.6139, longitude = 77.2090, timezone = 5.5 } = body;

    if (!day || !month || !year) {
      return NextResponse.json({ success: false, error: 'Date is required' }, { status: 400 });
    }

    const payload = {
      day: parseInt(day),
      month: parseInt(month),
      year: parseInt(year),
      hour: 5,
      min: 30, // Standard panchang time
      lat: latitude,
      lon: longitude,
      tzone: timezone,
      name: 'User'
    };

    const userId = process.env.ASTROLOGYAPI_USER_ID;
    const apiKey = process.env.ASTROLOGYAPI_API_KEY;

    const response = await axios.post(
      'http://json.astrologyapi.com/v1/advanced_panchang/',
      new URLSearchParams(payload as any),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${userId}:${apiKey}`).toString('base64')}`,
          'Accept-Language': language
        },
        timeout: 10000
      }
    );

    return NextResponse.json({
      success: true,
      data: response.data
    });

  } catch (error: any) {
    console.error('Panchang error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const payload = {
      day, month, year,
      hour: 5, min: 30,
      lat: 28.6139, lon: 77.2090, tzone: 5.5
    };

    const userId = process.env.ASTROLOGYAPI_USER_ID;
    const apiKey = process.env.ASTROLOGYAPI_API_KEY;

    const response = await axios.post(
      'http://json.astrologyapi.com/v1/advanced_panchang/',
      new URLSearchParams(payload as any),
      {
        headers: { Authorization: `Basic ${Buffer.from(`${userId}:${apiKey}`).toString('base64')}` }
      }
    );

    return NextResponse.json({
      success: true,
      data: response.data,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}