import { apiService } from './apiService';
import { getCurrentUser } from './authUtils';

// ================ CATEGORIES OPERATIONS ================

export const categoriesService = {
  // Get all categories for current user (dashboard)
  async getCategories() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.getCategories();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch categories');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories from API:', error);
      return [];
    }
  },

  // Get categories for public display (no auth required)
  async getPublicCategories() {
    try {
      const response = await apiService.getCategories();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch categories');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public categories:', error);
      return [];
    }
  },

  // Create new category
  async createCategory(categoryData) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.createCategory(categoryData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create category');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  async updateCategory(id, categoryData) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.updateCategory(id, categoryData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update category');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(id) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await apiService.deleteCategory(id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete category');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}; 