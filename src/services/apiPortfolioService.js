// API-based portfolio service for public portfolio data
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiPortfolioService {
  // Make public API request (no authentication required)
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ================ PUBLIC PORTFOLIO OPERATIONS ================

  // Get published projects
  async getPublishedProjects() {
    try {
      const result = await this.makeRequest('/api/portfolio/projects');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching published projects:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Get categories
  async getCategories() {
    try {
      const result = await this.makeRequest('/api/portfolio/categories');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get domains and technologies
  async getDomainsTechnologies() {
    try {
      const result = await this.makeRequest('/api/portfolio/domains-technologies');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching domains/technologies:', error);
      return [];
    }
  }

  // Get niches
  async getNiches() {
    try {
      const result = await this.makeRequest('/api/portfolio/niches');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching niches:', error);
      return [];
    }
  }

  // Get public settings
  async getPublicSettings() {
    try {
      console.log('🔍 API: Fetching public settings...');
      const result = await this.makeRequest('/api/portfolio/public-settings');
      console.log('✅ API: Public settings fetched successfully');
      return result.data || {};
    } catch (error) {
      console.error('❌ API: Public settings fetch failed:', error);
      // Return default settings on error
      return {
        primary_color: '#3b82f6',
        secondary_color: '#1e40af',
        accent_color: '#f59e0b',
        site_title: 'Portfolio',
        site_description: 'Professional Portfolio',
        theme_mode: 'light',
        color_scheme: 'blue'
      };
    }
  }

  // ================ CONVENIENCE METHODS ================

  // Get all portfolio data at once
  async getAllPortfolioData() {
    try {
      const [projects, categories, domainsTech, niches, settings] = await Promise.all([
        this.getPublishedProjects(),
        this.getCategories(),
        this.getDomainsTechnologies(),
        this.getNiches(),
        this.getPublicSettings()
      ]);

      return {
        projects,
        categories,
        domainsTechnologies: domainsTech,
        niches,
        settings
      };
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      return {
        projects: [],
        categories: [],
        domainsTechnologies: [],
        niches: [],
        settings: {}
      };
    }
  }

  // Get filtered projects by category
  async getProjectsByCategory(category) {
    try {
      const projects = await this.getPublishedProjects();
      return projects.filter(project => 
        project.category && project.category.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching projects by category:', error);
      return [];
    }
  }

  // Get project by ID
  async getProjectById(id) {
    try {
      const projects = await this.getPublishedProjects();
      return projects.find(project => project.id === parseInt(id));
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }
  }

  // Get domains only
  async getDomains() {
    try {
      const domainsTech = await this.getDomainsTechnologies();
      return domainsTech.filter(item => item.type === 'domain');
    } catch (error) {
      console.error('Error fetching domains:', error);
      return [];
    }
  }

  // Get technologies only
  async getTechnologies() {
    try {
      const domainsTech = await this.getDomainsTechnologies();
      return domainsTech.filter(item => item.type === 'technology');
    } catch (error) {
      console.error('Error fetching technologies:', error);
      return [];
    }
  }

  // ================ CONTACT FORM SUBMISSION ================

  // Submit contact form
  async submitContactForm(formData) {
    try {
      const result = await this.makeRequest('/api/contact/submit', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return { success: false, error: error.message };
    }
  }

  // Submit onboarding form
  async submitOnboardingForm(formData) {
    try {
      const result = await this.makeRequest('/api/contact/onboarding', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error submitting onboarding form:', error);
      return { success: false, error: error.message };
    }
  }

  // ================ CACHING AND PERFORMANCE ================

  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get cached data or fetch fresh
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetchFunction();
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cached published projects
  async getCachedPublishedProjects() {
    return this.getCachedData('publishedProjects', () => this.getPublishedProjects());
  }

  // Get cached portfolio settings
  async getCachedPublicSettings() {
    return this.getCachedData('publicSettings', () => this.getPublicSettings());
  }
}

// Create and export singleton instance
export const apiPortfolioService = new ApiPortfolioService();
export default apiPortfolioService; 