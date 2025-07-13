// API Service for Portfolio Data Management
// Handles all data operations through the API while keeping images with Supabase

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
    this.token = null;
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

  // Make authenticated request
  async makeRequest(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  // ================ AUTHENTICATION ================

  async register(email, password) {
    return await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
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

  // Get published projects (public)
  async getPublishedProjects() {
    return await this.makeRequest('/projects');
  }

  // Get user's projects (dashboard)
  async getUserProjects() {
    return await this.makeRequest('/dashboard/projects');
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
    return await this.makeRequest('/categories');
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
    return await this.makeRequest('/technologies');
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
    return await this.makeRequest('/skills');
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

  // ================ NICHES ================

  async getNiches() {
    return await this.makeRequest('/niches');
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
    return await this.makeRequest('/settings');
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

  // ================ UTILITY METHODS ================

  // Check if API is available
  async checkApiHealth() {
    try {
      await this.makeRequest('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Test connection
  async testConnection() {
    try {
      const response = await this.makeRequest('/projects');
      return response.success;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export for use in other services
export default apiService; 