import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { generateToken } from '@/utils/auth';
import { AuthRequest, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: AuthRequest & { fullName?: string; domain?: string; subdomain?: string } = await request.json();
    const { email, password, fullName, domain, subdomain } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // If subdomain is provided, use enhanced signup with subdomain
    if (subdomain) {
      // Validate subdomain format
      const subdomainRegex = /^[a-zA-Z0-9-]+$/;
      if (!subdomainRegex.test(subdomain)) {
        return NextResponse.json(
          { success: false, error: 'Subdomain can only contain letters, numbers, and hyphens' },
          { status: 400 }
        );
      }

      if (subdomain.length < 3 || subdomain.length > 20) {
        return NextResponse.json(
          { success: false, error: 'Subdomain must be between 3 and 20 characters' },
          { status: 400 }
        );
      }

      // Check if subdomain is already taken
      const existingDomain = await UserService.getDomainByName(`https://${subdomain}.theexpertways.com/`);
      if (existingDomain.success) {
        return NextResponse.json(
          { success: false, error: 'This subdomain is already taken. Please choose a different one.' },
          { status: 400 }
        );
      }

      // Create user with subdomain
      const createResult = await UserService.createUserWithSubdomain(email, password, subdomain);
      if (!createResult.success) {
        return NextResponse.json(
          { success: false, error: createResult.error },
          { status: 400 }
        );
      }

      const user = createResult.data!;
      const token = generateToken(user);

      const response: AuthResponse = {
        success: true,
        user,
        token
      };

      return NextResponse.json(response, { status: 201 });
    } else if (domain && fullName) {
      // Legacy enhanced signup with domain (for backward compatibility)
      // Validate domain format
      if (!domain.includes('://') || !domain.includes('.')) {
        return NextResponse.json(
          { success: false, error: 'Please provide a valid domain (e.g., http://yourdomain.com)' },
          { status: 400 }
        );
      }

      // Create user with domain and portfolio setup
      const createResult = await UserService.createUserWithDomain(email, password, fullName, domain);
      if (!createResult.success) {
        return NextResponse.json(
          { success: false, error: createResult.error },
          { status: 400 }
        );
      }

      const user = createResult.data!;
      const token = generateToken(user);

      const response: AuthResponse = {
        success: true,
        user,
        token
      };

      return NextResponse.json(response, { status: 201 });
    } else {
      // Legacy signup without domain (for backward compatibility)
      const createResult = await UserService.createUser(email, password);
      if (!createResult.success) {
        return NextResponse.json(
          { success: false, error: createResult.error },
          { status: 400 }
        );
      }

      const user = createResult.data!;
      const token = generateToken(user);

      const response: AuthResponse = {
        success: true,
        user,
        token
      };

      return NextResponse.json(response, { status: 201 });
    }
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 