///Users/xeoren/Desktop/gyanitallk-admin/src/lib/auth-helper.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  email?: string;
  name?: string;
  contactNo?: string;
}

/**
 * Verify JWT token and return user data
 * @param request - NextRequest object
 * @returns AuthUser object or null if not authenticated
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as any;

    return {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      name: decoded.name,
      contactNo: decoded.contactNo
    };

  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract user ID from request (for easier usage)
 */
export async function getUserId(request: NextRequest): Promise<number | null> {
  const user = await verifyAuthToken(request);
  return user ? user.id : null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await verifyAuthToken(request);
  return user !== null;
}