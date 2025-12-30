///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/cron/cleanup-sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';

// This should be called by a cron job daily
// Setup in Vercel Cron or use external service like cron-job.org
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const cronSecret = request.headers.get('authorization');
    
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    await SessionManager.cleanExpiredSessions();

    return NextResponse.json({
      success: true,
      message: 'Expired sessions cleaned successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Cleanup failed',
      message: error.message
    }, { status: 500 });
  }
}