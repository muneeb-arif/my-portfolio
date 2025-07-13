import { fallbackDataService } from './fallbackDataService';
import { portfolioConfig } from '../config/portfolio';
import { projectsService } from './projectsService';

// ================ PUBLIC PORTFOLIO OPERATIONS ================
// These functions fetch data for the public portfolio (no authentication required)

export const portfolioService = {
  // Get all published projects for public display
  async getPublishedProjects() {
    try {
      // Use API only
      const data = await projectsService.getPublishedProjects();
      
      // Transform data to match existing frontend format
      return data?.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category || 'Web Development',
        image: project.project_images?.[0]?.url || '/images/domains/default.jpeg',
        buttonText: 'View Details',
        details: {
          overview: project.overview || project.description,
          technologies: Array.isArray(project.technologies) ? project.technologies : [],
          features: Array.isArray(project.features) ? project.features : [],
          liveUrl: project.live_url || '#',
          githubUrl: project.github_url || '#',
          images: project.project_images?.map(img => ({
            url: img.url,
            caption: null // Don't show filenames as captions
          })) || []
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching published projects from API:', error);
      // Return fallback data when API fails
      return this.transformFallbackProjects(fallbackDataService.getProjects());
    }
  },

  // Get published projects by category
  async getPublishedProjectsByCategory(category) {
    try {
      if (category === 'All') {
        return this.getPublishedProjects();
      }

      const allProjects = await this.getPublishedProjects();
      return allProjects.filter(project => project.category === category);
    } catch (error) {
      // console.error('Error fetching projects by category:', error);
      return [];
    }
  },

  // Get available categories
  async getAvailableCategories() {
    try {
      // Use API instead of Supabase
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_BASE}/categories`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch categories');
      }
      
      const categories = data.data || [];
      const categoryNames = categories.map(cat => cat.name);
      
      // Always include 'All' as the first option
      return ['All', ...categoryNames];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return fallback categories
      const fallbackCategories = fallbackDataService.getCategories();
      return ['All', ...fallbackCategories];
    }
  },

  // Get domains and technologies for public display
  async getDomainsTechnologies() {
    try {
      // Use API instead of Supabase
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_BASE}/technologies`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch technologies');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching domains/technologies:', error);
      return fallbackDataService.getTechnologies();
    }
  },

  // Get niches for public display
  async getNiches() {
    try {
      // Use API instead of Supabase
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_BASE}/niches`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch niches');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching niches:', error);
      return fallbackDataService.getNiches();
    }
  },

  // Get public settings
  async getPublicSettings() {
    try {
      // Use API instead of Supabase
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_BASE}/settings`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch settings');
      }
      
      const settings = data.data || {};
      
      // Merge with default settings
      return {
        ...portfolioConfig.defaultSettings,
        ...settings
      };
    } catch (error) {
      console.error('Error fetching public settings:', error);
      return portfolioConfig.defaultSettings;
    }
  },

  // Transform fallback projects to match expected format
  transformFallbackProjects(fallbackProjects) {
    return fallbackProjects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      image: project.image,
      buttonText: 'View Details',
      details: {
        overview: project.overview,
        technologies: project.technologies || [],
        features: project.features || [],
        liveUrl: project.live_url || '#',
        githubUrl: project.github_url || '#',
        images: project.image ? [{ url: project.image, caption: project.title }] : []
      }
    }));
  }
};

export default portfolioService; 