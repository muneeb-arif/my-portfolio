// API Service for Portfolio Data Management
// Handles all data operations through the API while keeping images with Supabase
// Includes fallback mechanisms for when API server fails

import { fallbackDataService } from './fallbackDataService';
import { fallbackUtils } from '../utils/fallbackUtils';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
    this.token = null;
    this.isApiAvailable = true; // Track API availability
    this.fallbackMode = false; // Track if we're in fallback mode
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('api_token', token);
  }

  // Get stored token
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('api_token');
    }
    return this.token;
  }

  // Clear token
  clearToken() {
    this.token = null;
    localStorage.removeItem('api_token');
  }

  // Check API health
  async checkApiHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isApiAvailable = data.status === 'healthy';
        return this.isApiAvailable;
      } else {
        this.isApiAvailable = false;
        return false;
      }
    } catch (error) {
      console.warn('API health check failed:', error.message);
      this.isApiAvailable = false;
      return false;
    }
  }

  // Make authenticated request with fallback
  async makeRequest(endpoint, options = {}) {
    // console.log(`🔍 API SERVICE: Making request to ${endpoint}`);
    
    // Check API health first if we haven't already
    if (this.isApiAvailable) {
      await this.checkApiHealth();
    }

    // If API is not available, throw error to trigger fallback
    if (!this.isApiAvailable) {
      // console.log(`🔍 API SERVICE: API not available, throwing error for ${endpoint}`);
      throw new Error('API server is not available');
    }

    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`🔍 API SERVICE: Using token for ${endpoint}: ${token.substring(0, 20)}...`);
    } else {
      console.log(`🔍 API SERVICE: No token for ${endpoint}`);
    }

    try {
      // console.log(`🔍 API SERVICE: Fetching ${this.baseUrl}${endpoint}`);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      // console.log(`🔍 API SERVICE: Response status for ${endpoint}: ${response.status}`);
      const data = await response.json();

      if (!response.ok) {
        // console.log(`🔍 API SERVICE: Request failed for ${endpoint}: ${data.error || response.status}`);
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      // console.log(`🔍 API SERVICE: Request successful for ${endpoint}, data length: ${data.data?.length || 0}`);
      return data;
    } catch (error) {
      // console.error(`🔍 API SERVICE: Request failed for ${endpoint}:`, error.message);
      
      // Mark API as unavailable for future requests
      this.isApiAvailable = false;
      
      // Show fallback notification if not already shown
      if (!this.fallbackMode) {
        this.fallbackMode = true;
        fallbackUtils.showFallbackNotification();
      }
      
      throw error;
    }
  }

  // Enhanced request with automatic fallback
  async makeRequestWithFallback(endpoint, options = {}, fallbackData = null) {
    try {
      return await this.makeRequest(endpoint, options);
    } catch (error) {
      console.warn(`API request failed, using fallback data for ${endpoint}:`, error.message);
      
      if (fallbackData) {
        return { success: true, data: fallbackData };
      }
      
      throw error;
    }
  }

  // ================ AUTHENTICATION ================

  async register(email, password, userData = {}) {
    return await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...userData })
    });
  }

  async login(email, password) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async getCurrentUser() {
    return await this.makeRequest('/auth/me');
  }

  async resetPassword(email) {
    return await this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async updatePassword(email, newPassword) {
    return await this.makeRequest('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword })
    });
  }

  // ================ PROJECTS ================

  // Get published projects (public) with fallback
  async getPublishedProjects() {
    return await this.makeRequestWithFallback(
      '/projects', 
      {}, 
      fallbackDataService.getProjects()
    );
  }

  // Get user's projects (dashboard) with fallback
  async getUserProjects() {
    // console.log('🔍 API SERVICE: Getting user projects...');
    const result = await this.makeRequestWithFallback(
      '/dashboard/projects', 
      {}, 
      fallbackDataService.getProjects()
    );
    console.log('🔍 API SERVICE: User projects result:', {
      success: result.success,
      dataLength: result.data?.length || 0,
      isFallback: !result.success
    });
    return result;
  }

  // Create new project
  async createProject(projectData) {
    return await this.makeRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  // Update project
  async updateProject(projectId, projectData) {
    return await this.makeRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  }

  // Delete project
  async deleteProject(projectId) {
    return await this.makeRequest(`/projects/${projectId}`, {
      method: 'DELETE'
    });
  }

  // Get project by ID
  async getProject(projectId) {
    return await this.makeRequest(`/projects/${projectId}`);
  }

  // ================ CATEGORIES ================

  async getCategories() {
    return await this.makeRequestWithFallback(
      '/categories', 
      {}, 
      fallbackDataService.getCategories()
    );
  }

  async createCategory(categoryData) {
    return await this.makeRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(categoryId, categoryData) {
    return await this.makeRequest(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(categoryId) {
    return await this.makeRequest(`/categories/${categoryId}`, {
      method: 'DELETE'
    });
  }

  // ================ TECHNOLOGIES ================

  async getTechnologies() {
    return await this.makeRequestWithFallback(
      '/technologies', 
      {}, 
      fallbackDataService.getTechnologies()
    );
  }

  async createTechnology(techData) {
    return await this.makeRequest('/technologies', {
      method: 'POST',
      body: JSON.stringify(techData)
    });
  }

  async updateTechnology(techId, techData) {
    return await this.makeRequest(`/technologies/${techId}`, {
      method: 'PUT',
      body: JSON.stringify(techData)
    });
  }

  async deleteTechnology(techId) {
    return await this.makeRequest(`/technologies/${techId}`, {
      method: 'DELETE'
    });
  }

  // ================ SKILLS ================

  async getSkills() {
    return await this.makeRequestWithFallback(
      '/skills', 
      {}, 
      fallbackDataService.getSkills()
    );
  }

  async createSkill(skillData) {
    return await this.makeRequest('/skills', {
      method: 'POST',
      body: JSON.stringify(skillData)
    });
  }

  async updateSkill(skillId, skillData) {
    return await this.makeRequest(`/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(skillData)
    });
  }

  async deleteSkill(skillId) {
    return await this.makeRequest(`/skills/${skillId}`, {
      method: 'DELETE'
    });
  }

  // Add skill to specific technology
  async addSkill(techId, skillData) {
    return await this.makeRequest('/skills', {
      method: 'POST',
      body: JSON.stringify({
        ...skillData,
        tech_id: techId
      })
    });
  }

  // ================ NICHES ================

  async getNiches() {
    return await this.makeRequestWithFallback(
      '/niches', 
      {}, 
      fallbackDataService.getNiches()
    );
  }

  async createNiche(nicheData) {
    return await this.makeRequest('/niches', {
      method: 'POST',
      body: JSON.stringify(nicheData)
    });
  }

  async updateNiche(nicheId, nicheData) {
    return await this.makeRequest(`/niches/${nicheId}`, {
      method: 'PUT',
      body: JSON.stringify(nicheData)
    });
  }

  async deleteNiche(nicheId) {
    return await this.makeRequest(`/niches/${nicheId}`, {
      method: 'DELETE'
    });
  }

  // ================ SETTINGS ================

  async getSettings() {
    return await this.makeRequestWithFallback(
      '/settings', 
      {}, 
      {} // Empty object as fallback for settings
    );
  }

  async updateSettings(settingsData) {
    return await this.makeRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  }

  // ================ CONTACT QUERIES ================

  async getContactQueries() {
    return await this.makeRequest('/contact-queries');
  }

  async createContactQuery(queryData) {
    return await this.makeRequest('/contact-queries', {
      method: 'POST',
      body: JSON.stringify(queryData)
    });
  }

  async updateContactQuery(queryId, queryData) {
    return await this.makeRequest(`/contact-queries/${queryId}`, {
      method: 'PUT',
      body: JSON.stringify(queryData)
    });
  }

  async deleteContactQuery(queryId) {
    return await this.makeRequest(`/contact-queries/${queryId}`, {
      method: 'DELETE'
    });
  }

  // ================ SHARED HOSTING UPDATES ================

  async getSharedHostingUpdates(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.order) queryParams.append('order', params.order);
    
    const queryString = queryParams.toString();
    const endpoint = `/shared-hosting-updates${queryString ? `?${queryString}` : ''}`;
    
    return await this.makeRequest(endpoint);
  }

  async createSharedHostingUpdate(updateData) {
    return await this.makeRequest('/shared-hosting-updates', {
      method: 'POST',
      body: JSON.stringify(updateData)
    });
  }

  async updateSharedHostingUpdate(updateId, updateData) {
    return await this.makeRequest(`/shared-hosting-updates/${updateId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  async deleteSharedHostingUpdate(updateId) {
    return await this.makeRequest(`/shared-hosting-updates/${updateId}`, {
      method: 'DELETE'
    });
  }

  // ================ UTILITY METHODS ================

  // Check if API is available
  isApiServerAvailable() {
    return this.isApiAvailable;
  }

  // Reset API availability (useful for testing)
  resetApiAvailability() {
    this.isApiAvailable = true;
    this.fallbackMode = false;
  }

  // Get current fallback mode status
  isInFallbackMode() {
    return this.fallbackMode;
  }
}

// Create and export singleton instance
export const apiService = new ApiService(); 