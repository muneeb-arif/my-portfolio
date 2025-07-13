import { apiService } from './apiService';
import { getCurrentUser } from './authUtils';

// ================ NICHES OPERATIONS ================

export const nichesService = {
  // Get all niches for current user (dashboard)
  async getNiches() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.getNiches();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch niches');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching niches from API:', error);
      return [];
    }
  },

  // Get niches for public display (no auth required)
  async getPublicNiches() {
    try {
      const response = await apiService.getNiches();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch niches');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public niches:', error);
      return [];
    }
  },

  // Create new niche
  async createNiche(nicheData) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.createNiche(nicheData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create niche');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating niche:', error);
      throw error;
    }
  },

  // Update niche
  async updateNiche(id, nicheData) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.updateNiche(id, nicheData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update niche');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating niche:', error);
      throw error;
    }
  },

  // Delete niche
  async deleteNiche(id) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.deleteNiche(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete niche');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting niche:', error);
      throw error;
    }
  }
}; 