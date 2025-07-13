// API Authentication Service
// Handles JWT-based authentication with Next.js API backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiAuthService {
  constructor() {
    this.token = localStorage.getItem('api_auth_token');
    this.user = null;
    
    // Load user from localStorage if token exists
    if (this.token) {
      const userData = localStorage.getItem('api_user_data');
      if (userData) {
        try {
          this.user = JSON.parse(userData);
        } catch (e) {
          console.error('Failed to parse user data:', e);
          this.clearAuthData();
        }
      }
    }
    
    console.log('🔧 API Auth Service initialized:', {
      hasToken: !!this.token,
      hasUser: !!this.user,
      apiUrl: API_BASE_URL
    });
  }

  async signIn(email, password) {
    console.log('🔐 API Auth: Attempting sign in for:', email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success && data.token) {
        this.token = data.token;
        this.user = data.user;
        
        // Store in localStorage
        localStorage.setItem('api_auth_token', this.token);
        localStorage.setItem('api_user_data', JSON.stringify(this.user));
        
        console.log('✅ API Auth: Sign in successful for user:', this.user.email);
        
        return {
          user: this.user,
          session: { access_token: this.token },
          error: null
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ API Auth: Sign in failed:', error);
      this.clearAuthData();
      return {
        user: null,
        session: null,
        error: { message: error.message }
      };
    }
  }

  async signUp(email, password, userData = {}) {
    console.log('🔐 API Auth: Attempting sign up for:', email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, userData })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      if (data.success && data.token) {
        this.token = data.token;
        this.user = data.user;
        
        // Store in localStorage
        localStorage.setItem('api_auth_token', this.token);
        localStorage.setItem('api_user_data', JSON.stringify(this.user));
        
        console.log('✅ API Auth: Sign up successful for user:', this.user.email);
        
        return {
          success: true,
          user: this.user,
          session: { access_token: this.token },
          error: null
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ API Auth: Sign up failed:', error);
      this.clearAuthData();
      return {
        success: false,
        user: null,
        session: null,
        error: { message: error.message }
      };
    }
  }

  async signOut() {
    console.log('🔐 API Auth: Signing out');
    this.clearAuthData();
    return { error: null };
  }

  async getCurrentUser() {
    if (!this.token || !this.user) {
      console.log('🔐 API Auth: No current user (no token/user data)');
      return { user: null, error: null };
    }

    console.log('🔐 API Auth: Returning current user:', this.user.email);
    return {
      user: this.user,
      error: null
    };
  }

  onAuthStateChange(callback) {
    console.log('🔐 API Auth: Setting up auth state change listener');
    
    // Immediately call with current state
    callback('SIGNED_IN', { user: this.user });
    
    // Return cleanup function
    return () => {
      console.log('🔐 API Auth: Auth state listener cleaned up');
    };
  }

  async resetPassword(email) {
    console.log('🔐 API Auth: Password reset not implemented yet');
    return {
      error: { message: 'Password reset not implemented for API service yet' }
    };
  }

  clearAuthData() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('api_auth_token');
    localStorage.removeItem('api_user_data');
    console.log('🔐 API Auth: Auth data cleared');
  }

  // Get authorization header for API requests
  getAuthHeader() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // Check if user is authenticated
  isAuthenticated() {
    const authenticated = !!(this.token && this.user);
    console.log('🔐 API Auth: Is authenticated:', authenticated);
    return authenticated;
  }
}

export const apiAuthService = new ApiAuthService(); 