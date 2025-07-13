import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/utils/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
  };
}

// Middleware to authenticate requests
export function authenticateRequest(req: NextRequest): AuthenticatedRequest {
  const authHeader = req.headers.get('authorization');
  const token = extractToken(authHeader || undefined);
  
  if (!token) {
    throw new Error('No token provided');
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new Error('Invalid token');
  }
  
  const authenticatedReq = req as AuthenticatedRequest;
  authenticatedReq.user = decoded;
  
  return authenticatedReq;
}

// Middleware wrapper for API routes
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const authenticatedReq = authenticateRequest(req);
      return await handler(authenticatedReq);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Authentication failed' 
        },
        { status: 401 }
      );
    }
  };
}

// Middleware wrapper for dynamic API routes with params
export function withAuthAndParams<T extends Record<string, string>>(
  handler: (req: AuthenticatedRequest, params: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, { params }: { params: T }) => {
    try {
      const authenticatedReq = authenticateRequest(req);
      return await handler(authenticatedReq, params);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Authentication failed' 
        },
        { status: 401 }
      );
    }
  };
}

// Check if user is portfolio owner
export function isPortfolioOwner(email: string): boolean {
  const ownerEmail = process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL;
  return email === ownerEmail;
} 