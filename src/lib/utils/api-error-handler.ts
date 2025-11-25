// lib/utils/api-error-handler.ts

import { NextResponse } from 'next/server';
import { pages_type } from '@prisma/client';
import { ErrorResponse } from '@/types/api/page';

/**
 * Handle 404 - Page not found errors
 */
export function handleNotFound(
  requestedType: string,
  validTypes: pages_type[]
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Page not found',
      message: `The requested page type '${requestedType}' does not exist`,
      availableTypes: validTypes,
    },
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

/**
 * Handle 500 - Internal server errors
 */
export function handleServerError(error: unknown): NextResponse<ErrorResponse> {
  console.error('Server error:', error);

  const errorMessage =
    error instanceof Error ? error.message : 'An unexpected error occurred';

  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      message: errorMessage,
    },
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

/**
 * Handle 400 - Bad request errors
 */
export function handleBadRequest(
  message: string = 'Invalid request'
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Bad request',
      message,
    },
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

/**
 * Handle 403 - Forbidden errors
 */
export function handleForbidden(
  message: string = 'Access forbidden'
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Forbidden',
      message,
    },
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

/**
 * Handle page inactive errors
 */
export function handlePageInactive(
  pageType: pages_type
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Page unavailable',
      message: `The ${pageType} page is currently not active`,
    },
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

/**
 * Create a generic error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: getErrorType(statusCode),
      message,
    },
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

/**
 * Get error type from status code
 */
function getErrorType(statusCode: number): string {
  const errorTypes: Record<number, string> = {
    400: 'Bad request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    429: 'Too many requests',
    500: 'Internal server error',
    502: 'Bad gateway',
    503: 'Service unavailable',
  };

  return errorTypes[statusCode] || 'Error';
}

/**
 * Log error with context
 */
export function logError(
  context: string,
  error: unknown,
  additionalData?: Record<string, any>
): void {
  const errorDetails = {
    context,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...additionalData,
  };

  console.error('API Error:', JSON.stringify(errorDetails, null, 2));
}

/**
 * Validate required fields
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!data[field] || data[field] === null || data[field] === undefined) {
      missingFields.push(String(field));
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Handle validation errors
 */
export function handleValidationError(
  missingFields: string[]
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation error',
      message: `Missing required fields: ${missingFields.join(', ')}`,
    },
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

/**
 * Check if error is a Prisma error
 */
export function isPrismaError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as any).code === 'string'
  );
}

/**
 * Handle Prisma-specific errors
 */
export function handlePrismaError(error: any): NextResponse<ErrorResponse> {
  const errorMessage = getPrismaErrorMessage(error.code);

  logError('Prisma Error', error, { code: error.code });

  return NextResponse.json(
    {
      success: false,
      error: 'Database error',
      message: errorMessage,
    },
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

/**
 * Get user-friendly message for Prisma error codes
 */
function getPrismaErrorMessage(code: string): string {
  const prismaErrorMessages: Record<string, string> = {
    P2000: 'The provided value is too long',
    P2001: 'Record not found',
    P2002: 'Unique constraint violation',
    P2003: 'Foreign key constraint violation',
    P2025: 'Record not found',
  };

  return (
    prismaErrorMessages[code] ||
    'A database error occurred. Please try again later.'
  );
}