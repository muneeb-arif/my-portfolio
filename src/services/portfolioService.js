import { getCurrentOrigin } from '../utils/domainUtils';
import { API_BASE } from '../utils/apiConfig';

// Portfolio service for public data (domain-based)
class PortfolioService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  // Get current domain for API calls
  getCurrentDomain() {
    const origin = getCurrentOrigin();
    // Add trailing slash to match database format
    return origin ? (origin.endsWith('/') ? origin : `${origin}/`) : null;
  }

  // Get public settings for current domain
  async getPublicSettings() {
    try {
      const domain = this.getCurrentDomain();
      console.log('🌐 PORTFOLIO SERVICE: Getting settings for domain:', domain);
      
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href
        }
      });

      if (!response.ok) {
        console.error(`❌ PORTFOLIO SERVICE: Settings API returned ${response.status}`);
        return {}; // Return empty object instead of throwing error
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ PORTFOLIO SERVICE: Settings loaded for domain:', domain);
        return data.data || {};
      } else {
        console.error('❌ PORTFOLIO SERVICE: Failed to load settings:', data.error);
        return {}; // Return empty object for graceful fallback
      }
    } catch (error) {
      console.error('❌ PORTFOLIO SERVICE: Error loading settings:', error);
      return {};
    }
  }

  // Get published projects for current domain
  async getPublishedProjects() {
    try {
      const domain = this.getCurrentDomain();
      console.log('🌐 PORTFOLIO SERVICE: Getting projects for domain:', domain);
      
      const response = await fetch(`${this.baseUrl}/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ PORTFOLIO SERVICE: Projects loaded for domain:', domain);
        const rawProjects = data.data || [];
        return this.transformApiProjects(rawProjects);
      } else {
        console.error('❌ PORTFOLIO SERVICE: Failed to load projects:', data.error);
        return [];
      }
    } catch (error) {
      console.error('❌ PORTFOLIO SERVICE: Error loading projects:', error);
      return [];
    }
  }

  // Get categories for current domain
  async getCategories() {
    try {
      const domain = this.getCurrentDomain();
      console.log('🌐 PORTFOLIO SERVICE: Getting categories for domain:', domain);
      
      const response = await fetch(`${this.baseUrl}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ PORTFOLIO SERVICE: Categories loaded for domain:', domain);
        return data.data || [];
      } else {
        console.error('❌ PORTFOLIO SERVICE: Failed to load categories:', data.error);
        return [];
      }
    } catch (error) {
      console.error('❌ PORTFOLIO SERVICE: Error loading categories:', error);
      return [];
    }
  }

  // Get technologies for current domain
  async getTechnologies() {
    try {
      const domain = this.getCurrentDomain();
      console.log('🌐 PORTFOLIO SERVICE: Getting technologies for domain:', domain);
      
      const response = await fetch(`${this.baseUrl}/technologies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ PORTFOLIO SERVICE: Technologies loaded for domain:', domain);
        return data.data || [];
      } else {
        console.error('❌ PORTFOLIO SERVICE: Failed to load technologies:', data.error);
        return [];
      }
    } catch (error) {
      console.error('❌ PORTFOLIO SERVICE: Error loading technologies:', error);
      return [];
    }
  }

  // Get niches for current domain
  async getNiches() {
    try {
      const domain = this.getCurrentDomain();
      console.log('🌐 PORTFOLIO SERVICE: Getting niches for domain:', domain);
      
      const response = await fetch(`${this.baseUrl}/niches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ PORTFOLIO SERVICE: Niches loaded for domain:', domain);
        return data.data || [];
      } else {
        console.error('❌ PORTFOLIO SERVICE: Failed to load niches:', data.error);
        return [];
      }
    } catch (error) {
      console.error('❌ PORTFOLIO SERVICE: Error loading niches:', error);
      return [];
    }
  }

  // Get contact queries for current domain (dashboard only)
  async getContactQueries() {
    try {
      const domain = this.getCurrentDomain();
      console.log('🌐 PORTFOLIO SERVICE: Getting contact queries for domain:', domain);
      
      const response = await fetch(`${this.baseUrl}/contact-queries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
          'Referer': window.location.href
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ PORTFOLIO SERVICE: Contact queries loaded for domain:', domain);
        return data.data || [];
      } else {
        console.error('❌ PORTFOLIO SERVICE: Failed to load contact queries:', data.error);
        return [];
      }
    } catch (error) {
      console.error('❌ PORTFOLIO SERVICE: Error loading contact queries:', error);
      return [];
    }
  }

  // Get published projects by category for current domain
  async getPublishedProjectsByCategory(category) {
    try {
      const allProjects = await this.getPublishedProjects();
      if (category === 'All') {
        return allProjects;
      }
      return allProjects.filter(project => project.category === category);
    } catch (error) {
      console.error('❌ PORTFOLIO SERVICE: Error filtering projects by category:', error);
      return [];
    }
  }

  // Transform API projects to frontend format
  transformApiProjects(projects) {
    return projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category || 'Web Development',
      image: project.project_images?.[0]?.url || '/images/hero-bg.png',
      buttonText: 'View Details',
      is_prompt: project.is_prompt || 0, // Preserve the is_prompt field
      status: project.status || 'draft',
      details: {
        overview: project.overview || project.description,
        technologies: Array.isArray(project.technologies) ? project.technologies : [],
        features: Array.isArray(project.features) ? project.features : [],
        liveUrl: project.live_url || '#',
        githubUrl: project.github_url || '#',
        images: project.project_images?.map(img => ({
          url: img.url,
          caption: null
        })) || []
      }
    }));
  }
}

// Create and export singleton instance
const portfolioService = new PortfolioService();
export default portfolioService; 