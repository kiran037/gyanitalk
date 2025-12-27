///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/panchang/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { day, month, year, language = 'en' } = body;

    // Validate input
    if (!day || !month || !year || isNaN(day) || isNaN(month) || isNaN(year)) {
      return NextResponse.json({
        success: false,
        error: 'Valid day, month, and year are required'
      }, { status: 400 });
    }

    // Default location (can be customized)
    const latitude = 28.6139; // Delhi
    const longitude = 77.2090;
    const timezone = 5.5;

    const payload = {
      day: parseInt(day),
      month: parseInt(month),
      year: parseInt(year),
      hour: 5,
      min: 20,
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
          ...(language && { 'Accept-Language': language })
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
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Panchang',
      message: error.message
    }, { status: 500 });
  }
}

// GET method for today's panchang
export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const latitude = 28.6139;
    const longitude = 77.2090;
    const timezone = 5.5;

    const payload = {
      day,
      month,
      year,
      hour: 5,
      min: 20,
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
          Authorization: `Basic ${Buffer.from(`${userId}:${apiKey}`).toString('base64')}`
        },
        timeout: 10000
      }
    );

    return NextResponse.json({
      success: true,
      data: response.data,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });

  } catch (error: any) {
    console.error('Panchang error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Panchang',
      message: error.message
    }, { status: 500 });
  }
}