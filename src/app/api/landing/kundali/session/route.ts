// ///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/session/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { SessionManager } from '@/lib/session-manager';

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const sessionId = searchParams.get('sessionId');

//     if (!sessionId) {
//       return NextResponse.json({
//         success: false,
//         error: 'Session ID required'
//       }, { status: 400 });
//     }

//     const sessionData = await SessionManager.getSession(sessionId);

//     if (!sessionData) {
//       return NextResponse.json({
//         success: false,
//         error: 'Session not found or expired'
//       }, { status: 404 });
//     }

//     return NextResponse.json({
//       success: true,
//       data: sessionData
//     });

//   } catch (error: any) {
//     console.error('Session retrieval error:', error);
//     return NextResponse.json({
//       success: false,
//       error: 'Failed to retrieve session',
//       message: error.message
//     }, { status: 500 });
//   }
// }


///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/landing/kundali/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';
import { APIError } from '@/lib/error-response';

/**
 * GET /api/landing/kundali/session
 * Retrieve kundli session data by session ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return APIError.badRequest('Session ID is required');
    }

    console.log('🔍 Retrieving session:', sessionId);

    const sessionData = await SessionManager.getSession(sessionId);

    if (!sessionData) {
      console.warn('⚠️ Session not found:', sessionId);
      return APIError.notFound('Session not found or expired');
    }

    console.log('✓ Session retrieved successfully');

    return NextResponse.json({
      success: true,
      data: sessionData,
      message: 'Session retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Session retrieval error:', error);
    return APIError.internalError(
      'Failed to retrieve session',
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
}