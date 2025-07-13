// API-based dashboard service to replace direct Supabase calls
import { apiAuthService } from './apiAuthService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiDashboardService {
  // Make authenticated API request
  async makeRequest(endpoint, options = {}) {
    return await apiAuthService.makeAuthenticatedRequest(endpoint, options);
  }

  // ================ CATEGORIES OPERATIONS ================
  
  async getCategories() {
    try {
      const result = await this.makeRequest('/api/dashboard/categories');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async addCategory(categoryData) {
    try {
      const result = await this.makeRequest('/api/dashboard/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
      return result.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id, updates) {
    try {
      const result = await this.makeRequest(`/api/dashboard/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return result.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      const result = await this.makeRequest(`/api/dashboard/categories/${id}`, {
        method: 'DELETE'
      });
      return result;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // ================ DOMAINS & TECHNOLOGIES OPERATIONS ================

  async getDomainsTechnologies() {
    try {
      const result = await this.makeRequest('/api/dashboard/domains-technologies');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching domains/technologies:', error);
      throw error;
    }
  }

  async createDomainTechnology(itemData) {
    try {
      const result = await this.makeRequest('/api/dashboard/domains-technologies', {
        method: 'POST',
        body: JSON.stringify(itemData)
      });
      return result.data;
    } catch (error) {
      console.error('Error creating domain/technology:', error);
      throw error;
    }
  }

  async updateDomainTechnology(id, updates) {
    try {
      const result = await this.makeRequest(`/api/dashboard/domains-technologies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return result.data;
    } catch (error) {
      console.error('Error updating domain/technology:', error);
      throw error;
    }
  }

  async deleteDomainTechnology(id) {
    try {
      const result = await this.makeRequest(`/api/dashboard/domains-technologies/${id}`, {
        method: 'DELETE'
      });
      return result;
    } catch (error) {
      console.error('Error deleting domain/technology:', error);
      throw error;
    }
  }

  // ================ TECH SKILLS OPERATIONS ================

  async addSkill(techId, skillData) {
    try {
      const result = await this.makeRequest('/api/dashboard/skills', {
        method: 'POST',
        body: JSON.stringify({
          technology_id: techId,
          ...skillData
        })
      });
      return result.data;
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  }

  async updateSkill(id, updates) {
    try {
      const result = await this.makeRequest(`/api/dashboard/skills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return result.data;
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  }

  async deleteSkill(id) {
    try {
      const result = await this.makeRequest(`/api/dashboard/skills/${id}`, {
        method: 'DELETE'
      });
      return result;
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  }

  // ================ NICHES OPERATIONS ================

  async getNiches() {
    try {
      const result = await this.makeRequest('/api/dashboard/niches');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching niches:', error);
      throw error;
    }
  }

  async createNiche(nicheData) {
    try {
      const result = await this.makeRequest('/api/dashboard/niches', {
        method: 'POST',
        body: JSON.stringify(nicheData)
      });
      return result.data;
    } catch (error) {
      console.error('Error creating niche:', error);
      throw error;
    }
  }

  async updateNiche(id, updates) {
    try {
      const result = await this.makeRequest(`/api/dashboard/niches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return result.data;
    } catch (error) {
      console.error('Error updating niche:', error);
      throw error;
    }
  }

  async deleteNiche(id) {
    try {
      const result = await this.makeRequest(`/api/dashboard/niches/${id}`, {
        method: 'DELETE'
      });
      return result;
    } catch (error) {
      console.error('Error deleting niche:', error);
      throw error;
    }
  }

  // ================ CONTACT QUERIES OPERATIONS ================

  async getContactQueries() {
    try {
      const result = await this.makeRequest('/api/dashboard/queries');
      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching contact queries:', error);
      return { success: false, error: error.message };
    }
  }

  async updateQueryStatus(queryId, status, notes = null) {
    try {
      const result = await this.makeRequest(`/api/dashboard/queries/${queryId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes })
      });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error updating query status:', error);
      return { success: false, error: error.message };
    }
  }

  // ================ SETTINGS OPERATIONS ================

  async getSettings() {
    try {
      const result = await this.makeRequest('/api/dashboard/settings');
      return result.data || {};
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  async getSetting(key) {
    try {
      const result = await this.makeRequest(`/api/dashboard/settings/${key}`);
      return result.data?.value;
    } catch (error) {
      if (error.message.includes('404')) {
        return null; // Setting doesn't exist
      }
      console.error('Error fetching setting:', error);
      throw error;
    }
  }

  async updateSetting(key, value) {
    try {
      const result = await this.makeRequest(`/api/dashboard/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value })
      });
      return result.data;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  async updateMultipleSettings(settings) {
    try {
      const result = await this.makeRequest('/api/dashboard/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      return result.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  async deleteSetting(key) {
    try {
      const result = await this.makeRequest(`/api/dashboard/settings/${key}`, {
        method: 'DELETE'
      });
      return result;
    } catch (error) {
      console.error('Error deleting setting:', error);
      throw error;
    }
  }

  // ================ HELPER METHODS ================

  // Get default appearance settings (client-side defaults)
  getDefaultAppearanceSettings() {
    return {
      primaryColor: '#3b82f6',
      secondaryColor: '#6b7280', 
      accentColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      cardBackgroundColor: '#f9fafb',
      borderColor: '#e5e7eb',
      theme: 'light',
      fontFamily: 'Inter',
      borderRadius: '0.5rem',
      spacing: 'medium'
    };
  }

  // Subscribe to data changes (placeholder for real-time updates)
  subscribeToNiches(callback) {
    console.log('Niches subscription started (placeholder)');
    return () => {
      console.log('Niches subscription ended (placeholder)');
    };
  }
}

// Create and export singleton instance
export const apiDashboardService = new ApiDashboardService();
export default apiDashboardService; 