import { apiService } from './apiService';
import { getCurrentUser } from './authUtils';

// ================ TECHNOLOGIES OPERATIONS ================

export const technologiesService = {
  // Get all technologies for current user (dashboard)
  async getTechnologies() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.getTechnologies();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch technologies');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching technologies from API:', error);
      return [];
    }
  },

  // Get technologies for public display (no auth required)
  async getPublicTechnologies() {
    try {
      const response = await apiService.getTechnologies();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch technologies');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public technologies:', error);
      return [];
    }
  },

  // Create new technology
  async createTechnology(techData) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.createTechnology(techData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create technology');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating technology:', error);
      throw error;
    }
  },

  // Update technology
  async updateTechnology(id, techData) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.updateTechnology(id, techData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update technology');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating technology:', error);
      throw error;
    }
  },

  // Delete technology
  async deleteTechnology(id) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.deleteTechnology(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete technology');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting technology:', error);
      throw error;
    }
  }
}; 