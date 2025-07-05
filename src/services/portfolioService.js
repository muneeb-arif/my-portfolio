import { supabase, TABLES } from '../config/supabase';
import { fallbackDataService } from './fallbackDataService';
import { publicPortfolioService } from './supabaseService';
import { portfolioConfig } from '../config/portfolio';

// ================ PUBLIC PORTFOLIO OPERATIONS ================
// These functions fetch data for the public portfolio (no authentication required)

const portfolioService = {
  // These functions now use context data - no direct API calls
  async getProjects() {
    // This function is now deprecated - use usePortfolioData context instead
    console.warn('⚠️ portfolioService.getProjects() is deprecated. Use usePortfolioData context instead.');
    return [];
  },

  async getDomainsTechnologies() {
    // This function is now deprecated - use usePortfolioData context instead
    console.warn('⚠️ portfolioService.getDomainsTechnologies() is deprecated. Use usePortfolioData context instead.');
    return [];
  },

  async getNiches() {
    // This function is now deprecated - use usePortfolioData context instead
    console.warn('⚠️ portfolioService.getNiches() is deprecated. Use usePortfolioData context instead.');
    return [];
  },

  // Public API functions (still need direct calls for public access)
  async getPublishedProjects() {
    try {
      // This is for public access, so we need to determine the user ID
      const userId = await this.determineUserId();
      if (!userId) {
        console.warn('⚠️ No user ID found for public projects');
        return [];
      }

      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .select(`
          *,
          project_images (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching published projects:', error);
      return [];
    }
  },

  async getPublicDomainsTechnologies() {
    try {
      const userId = await this.determineUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('domains_technologies')
        .select(`
          *,
          tech_skills (*)
        `)
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching public domains/technologies:', error);
      return [];
    }
  },

  async getPublicNiches() {
    try {
      const userId = await this.determineUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('niche')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching public niches:', error);
      return [];
    }
  },

  async determineUserId() {
    try {
      // First try to get from environment config
      const envEmail = process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL;
      
      if (envEmail) {
        const { data, error } = await supabase
          .from('portfolio_config')
          .select('owner_user_id')
          .eq('owner_email', envEmail)
          .eq('is_active', true)
          .single();
        
        if (!error && data) {
          return data.owner_user_id;
        }
      }

      // Fallback to any active portfolio config
      const { data, error } = await supabase
        .from('portfolio_config')
        .select('owner_user_id')
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      return data.owner_user_id;
    } catch (error) {
      console.error('Error determining user ID:', error);
      return null;
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