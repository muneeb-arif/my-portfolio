import { apiService } from './apiService';
import { getCurrentUser } from './authUtils';

// ================ PROJECT OPERATIONS ================

export const projectsService = {
  // Get all projects for current user (dashboard)
  async getProjects() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.getUserProjects();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch projects');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching projects from API:', error);
      return [];
    }
  },

  // Get single project
  async getProject(id) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.getProject(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch project');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Create new project
  async createProject(projectData) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.createProject(projectData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create project');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update project
  async updateProject(id, projectData) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.updateProject(id, projectData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update project');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete project
  async deleteProject(id) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.deleteProject(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete project');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Get published projects (public)
  async getPublishedProjects() {
    try {
      const response = await apiService.getPublishedProjects();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch published projects');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching published projects:', error);
      return [];
    }
  }
}; 