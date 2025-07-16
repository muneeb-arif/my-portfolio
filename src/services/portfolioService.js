import { fallbackDataService } from './fallbackDataService';
import { fallbackUtils } from '../utils/fallbackUtils';
import { portfolioConfig } from '../config/portfolio';
import { projectsService } from './projectsService';
import { apiService } from './apiService';

// ================ PUBLIC PORTFOLIO OPERATIONS ================
// These functions fetch data for the public portfolio (no authentication required)

export const portfolioService = {
  // Get all published projects for public display
  async getPublishedProjects() {
    try {
      // Use API with fallback
      const response = await apiService.getPublishedProjects();
      
      console.log('[portfolioService] API response:', response);
      
      // Use fallback if API fails OR returns empty data
      if (!response.success || !response.data || response.data.length === 0) {
        console.log('📊 No projects from API, using fallback data');
        fallbackUtils.showFallbackNotification();
        return this.transformFallbackProjects(fallbackDataService.getProjects());
      }
      
      const data = response.data || [];
      console.log('[portfolioService] Raw API data:', data);
      
      // Transform data to match existing frontend format
      const transformedData = data?.map(project => ({
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
      
      console.log('[portfolioService] Transformed projects:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching published projects from API:', error);
      // Return fallback data when API fails
      fallbackUtils.showFallbackNotification();
      return this.transformFallbackProjects(fallbackDataService.getProjects());
    }
  },

  // Transform fallback projects to match frontend format
  transformFallbackProjects(projects) {
    return projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category || 'Web Development',
      image: project.image || '/images/domains/default.jpeg',
      buttonText: 'View Details',
      details: {
        overview: project.overview || project.description,
        technologies: Array.isArray(project.technologies) ? project.technologies : [],
        features: Array.isArray(project.features) ? project.features : [],
        liveUrl: project.live_url || '#',
        githubUrl: project.github_url || '#',
        images: [{
          url: project.image || '/images/domains/default.jpeg',
          caption: null
        }]
      }
    }));
  },

  // Get categories for public display
  async getCategories() {
    try {
      // Use API with fallback
      const response = await apiService.getCategories();
      
      // Use fallback if API fails OR returns empty data
      if (!response.success || !response.data || response.data.length === 0) {
        console.log('📁 No categories from API, using fallback data');
        fallbackUtils.showFallbackNotification();
        return fallbackDataService.getCategories();
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      fallbackUtils.showFallbackNotification();
      return fallbackDataService.getCategories();
    }
  },

  // Get technologies for public display
  async getTechnologies() {
    try {
      // Use API with fallback
      const response = await apiService.getTechnologies();
      
      console.log('[portfolioService] Technologies API response:', response);
      
      // Use fallback if API fails OR returns empty data
      if (!response.success || !response.data || response.data.length === 0) {
        console.log('🎯 No technologies from API, using fallback data');
        fallbackUtils.showFallbackNotification();
        return fallbackDataService.getTechnologies();
      }
      
      const data = response.data || [];
      console.log('[portfolioService] Raw technologies data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching technologies:', error);
      fallbackUtils.showFallbackNotification();
      return fallbackDataService.getTechnologies();
    }
  },

  // Get niches for public display
  async getNiches() {
    try {
      // Use API with fallback
      const response = await apiService.getNiches();
      
      console.log('[portfolioService] Niches API response:', response);
      
      // Use fallback if API fails OR returns empty data
      if (!response.success || !response.data || response.data.length === 0) {
        console.log('🏆 No niches from API, using fallback data');
        fallbackUtils.showFallbackNotification();
        return fallbackDataService.getNiches();
      }
      
      const data = response.data || [];
      console.log('[portfolioService] Raw niches data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching niches:', error);
      fallbackUtils.showFallbackNotification();
      return fallbackDataService.getNiches();
    }
  },

  // Get public settings
  async getPublicSettings() {
    try {
      // Use API with fallback
      const response = await apiService.getSettings();
      
      if (!response.success) {
        throw new Error('Failed to fetch settings from API');
      }
      
      return response.data || {};
    } catch (error) {
      console.error('Error fetching public settings:', error);
      // Return empty object as fallback for settings
      return {};
    }
  }
};

export default portfolioService; 