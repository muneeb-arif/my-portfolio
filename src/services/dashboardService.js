import { apiService } from './apiService';
import { getCurrentUser } from './authUtils';

// Dashboard Service - Uses API instead of direct Supabase calls
export const dashboardService = {
  // Get dashboard overview data
  async getDashboardData() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      console.log('📊 DASHBOARD SERVICE: Getting dashboard data for user:', user.email);

      // Get all data in parallel
      const [projectsResponse, technologiesResponse, nichesResponse, categoriesResponse] = await Promise.all([
        apiService.getUserProjects(),
        apiService.getTechnologies(),
        apiService.getNiches(),
        apiService.getCategories()
      ]);

      console.log('📊 DASHBOARD SERVICE: API responses:', {
        projects: projectsResponse.success ? `${projectsResponse.data?.length || 0} projects` : 'Failed',
        technologies: technologiesResponse.success ? `${technologiesResponse.data?.length || 0} technologies` : 'Failed',
        niches: nichesResponse.success ? `${nichesResponse.data?.length || 0} niches` : 'Failed',
        categories: categoriesResponse.success ? `${categoriesResponse.data?.length || 0} categories` : 'Failed'
      });

      // Calculate stats
      const projects = projectsResponse.data || [];
      const published = projects.filter(p => p.status === 'published').length;
      const drafts = projects.filter(p => p.status === 'draft').length;

      console.log('📊 DASHBOARD SERVICE: Project stats:', {
        total: projects.length,
        published,
        drafts
      });

      return {
        success: true,
        data: {
          stats: {
            totalProjects: projects.length,
            publishedProjects: published,
            draftProjects: drafts,
            totalViews: projects.reduce((sum, p) => sum + (p.views || 0), 0)
          },
          projects: projects, // All projects for pagination
          technologies: technologiesResponse.data || [],
          niches: nichesResponse.data || [],
          categories: categoriesResponse.data || []
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        error: error.message,
        data: {
          stats: { totalProjects: 0, publishedProjects: 0, draftProjects: 0, totalViews: 0 },
          projects: [],
          technologies: [],
          niches: [],
          categories: []
        }
      };
    }
  },

  // Get database status for sync functionality
  async getDatabaseStatus() {
    try {
      const [projectsResponse, technologiesResponse, nichesResponse, categoriesResponse] = await Promise.all([
        apiService.getUserProjects(),
        apiService.getTechnologies(),
        apiService.getNiches(),
        apiService.getCategories()
      ]);

      const totalCount = (
        (projectsResponse.data?.length || 0) +
        (technologiesResponse.data?.length || 0) +
        (nichesResponse.data?.length || 0) +
        (categoriesResponse.data?.length || 0)
      );

      return {
        projects: projectsResponse.data?.length || 0,
        technologies: technologiesResponse.data?.length || 0,
        niches: nichesResponse.data?.length || 0,
        categories: categoriesResponse.data?.length || 0,
        isEmpty: totalCount === 0
      };
    } catch (error) {
      console.error('Error getting database status:', error);
      return {
        projects: 0,
        technologies: 0,
        niches: 0,
        categories: 0,
        isEmpty: false
      };
    }
  },

  // Check if database is empty
  async isDatabaseEmpty() {
    try {
      const status = await this.getDatabaseStatus();
      return status.isEmpty;
    } catch (error) {
      console.error('Error checking if database is empty:', error);
      return false;
    }
  },

  // Get shared hosting updates (for dashboard widgets)
  async getSharedHostingUpdates(params = {}) {
    try {
      const response = await apiService.getSharedHostingUpdates(params);
      return response;
    } catch (error) {
      console.error('Error fetching shared hosting updates:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  // Get recent activity (placeholder for future implementation)
  async getRecentActivity() {
    try {
      // This could be implemented later to show recent changes
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}; 