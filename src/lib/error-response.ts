///Users/xeoren/Desktop/gyanitallk-admin/src/lib/error-response.ts
import { NextResponse } from 'next/server';

export class APIError {
  static badRequest(message: string, errors?: Record<string, string>) {
    return NextResponse.json({
      success: false,
      error: 'Bad Request',
      message,
      ...(errors && { errors })
    }, { status: 400 });
  }

  static unauthorized(message: string = 'Authentication required') {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized',
      message,
      requiresLogin: true
    }, { status: 401 });
  }

  static paymentRequired(
    message: string,
    currentBalance: number,
    requiredAmount: number
  ) {
    return NextResponse.json({
      success: false,
      error: 'Payment Required',
      message,
      requiresPayment: true,
      currentBalance,
      requiredAmount,
      shortfall: requiredAmount - currentBalance
    }, { status: 402 });
  }

  static notFound(message: string = 'Resource not found') {
    return NextResponse.json({
      success: false,
      error: 'Not Found',
      message
    }, { status: 404 });
  }

  static rateLimitExceeded(
    resetAt: Date,
    remaining: number = 0,
    requiresLogin: boolean = false
  ) {
    return NextResponse.json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: `Daily limit reached. ${requiresLogin ? 'Login to get more free generations or ' : ''}Try again after ${resetAt.toLocaleString()}`,
      resetAt,
      remaining,
      requiresLogin
    }, { status: 429 });
  }

  static internalError(message: string = 'Internal server error', details?: any) {
    return NextResponse.json({
      success: false,
      error: 'Internal Server Error',
      message,
      ...(process.env.NODE_ENV === 'development' && details && { details })
    }, { status: 500 });
  }

  static custom(statusCode: number, error: string, message: string, additionalData?: any) {
    return NextResponse.json({
      success: false,
      error,
      message,
      ...additionalData
    }, { status: statusCode });
  }
}