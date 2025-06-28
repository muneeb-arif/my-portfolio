import { supabase } from '../config/supabase';
import { fallbackDataService } from './fallbackDataService';
import { fallbackUtils } from '../utils/fallbackUtils';
import { publicPortfolioService } from './supabaseService';
import { portfolioConfig } from '../config/portfolio';

// ================ PUBLIC PORTFOLIO OPERATIONS ================
// These functions fetch data for the public portfolio (no authentication required)

export const portfolioService = {
  // Get all published projects for public display
  async getPublishedProjects() {
    try {
      const data = await publicPortfolioService.getPublishedProjects();
      
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
            caption: img.original_name || 'Project Image'
          })) || []
        }
      })) || [];
    } catch (error) {
      // console.error('Error fetching published projects:', error);
      // Return fallback data when Supabase fails
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
      const categories = await publicPortfolioService.getCategories();
      const categoryNames = categories.map(cat => cat.name);
      
      // Always include 'All' as the first option
      return ['All', ...categoryNames];
    } catch (error) {
      // console.error('Error fetching categories:', error);
      // Return fallback categories
      const fallbackCategories = fallbackDataService.getCategories();
      return ['All', ...fallbackCategories];
    }
  },

  // Get domains and technologies for public display
  async getDomainsTechnologies() {
    try {
      return await publicPortfolioService.getDomainsTechnologies();
    } catch (error) {
      // console.error('Error fetching domains/technologies:', error);
      return fallbackDataService.getTechnologies();
    }
  },

  // Get niches for public display
  async getNiches() {
    try {
      return await publicPortfolioService.getNiches();
    } catch (error) {
      // console.error('Error fetching niches:', error);
      return fallbackDataService.getNiches();
    }
  },

  // Get public settings
  async getPublicSettings() {
    try {
      const settings = await publicPortfolioService.getPublicSettings();
      
      // Merge with default settings
      return {
        ...portfolioConfig.defaultSettings,
        ...settings
      };
    } catch (error) {
      // console.error('Error fetching public settings:', error);
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