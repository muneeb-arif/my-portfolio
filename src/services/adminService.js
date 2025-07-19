import { apiService } from './apiService';
import { getCurrentUser } from './authUtils';

// Admin Service for frontend
export const adminService = {
  // Get admin sections for the current user
  async getAdminSections() {
    try {
      const user = await getCurrentUser();
      console.log('🔒 Admin Service: getCurrentUser result:', user);
      console.log('🔒 Admin Service: user.is_admin:', user?.is_admin);
      console.log('🔒 Admin Service: user.is_admin type:', typeof user?.is_admin);
      
      if (!user) {
        console.log('🔒 Admin Service: No authenticated user');
        return { success: false, data: { sections: [], permissions: [] } };
      }

      // Check if user is admin from JWT
      if (!user.is_admin) {
        console.log('🔒 Admin Service: User is not admin:', user.email);
        return { success: false, data: { sections: [], permissions: [] } };
      }

      console.log('🔒 Admin Service: Fetching admin sections for admin user:', user.email);

      // Get the token from apiService (which uses the correct field)
      const token = apiService.getToken();
      if (!token) {
        console.log('🔒 Admin Service: No token available');
        return { success: false, data: { sections: [], permissions: [] } };
      }

      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE}/admin/sections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('🔒 Admin Service: Admin sections loaded:', result.data.sections.length);
        return result;
      } else {
        console.log('🔒 Admin Service: Failed to load admin sections:', result.error);
        return { success: false, data: { sections: [], permissions: [] } };
      }
    } catch (error) {
      console.error('🔒 Admin Service: Error fetching admin sections:', error);
      return { success: false, data: { sections: [], permissions: [] } };
    }
  },

  // Check if user has access to a specific admin section
  async hasSectionAccess(sectionKey) {
    try {
      const user = await getCurrentUser();
      if (!user || !user.is_admin) {
        return false;
      }

      const token = apiService.getToken();
      if (!token) {
        return false;
      }

      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE}/admin/sections/${sectionKey}/access`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.success && result.data.hasAccess;
    } catch (error) {
      console.error('🔒 Admin Service: Error checking section access:', error);
      return false;
    }
  },

  // Get accessible admin section keys for the current user
  async getAccessibleSectionKeys() {
    try {
      const result = await this.getAdminSections();
      if (result.success && result.data.sections) {
        return result.data.sections.map(section => section.section_key);
      }
      return [];
    } catch (error) {
      console.error('🔒 Admin Service: Error getting accessible sections:', error);
      return [];
    }
  },

  // Check if user is admin (has any admin sections access)
  async isAdmin() {
    try {
      const user = await getCurrentUser();
      return user?.is_admin || false;
    } catch (error) {
      console.error('🔒 Admin Service: Error checking admin status:', error);
      return false;
    }
  }
}; 