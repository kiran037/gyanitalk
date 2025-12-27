///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID required'
      }, { status: 400 });
    }

    const sessionData = await SessionManager.getSession(sessionId);

    if (!sessionData) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or expired'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: sessionData
    });

  } catch (error: any) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve session',
      message: error.message
    }, { status: 500 });
  }
}