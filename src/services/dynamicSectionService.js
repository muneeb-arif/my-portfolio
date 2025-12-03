import { apiService } from './apiService';
import { API_BASE } from '../utils/apiConfig';

class DynamicSectionService {
  // List all sections (public API - returns only visible sections)
  async listSections() {
    try {
      const response = await fetch(`${API_BASE}/dynamic-sections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error listing sections:', error);
      return { success: false, error: error.message };
    }
  }

  // Get single section by ID
  async getSection(id) {
    try {
      const response = await fetch(`${API_BASE}/dynamic-sections?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting section:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new section (authenticated)
  async createSection(sectionData) {
    return await apiService.makeRequest('/dynamic-sections', {
      method: 'POST',
      body: JSON.stringify(sectionData)
    });
  }

  // Update section (authenticated)
  async updateSection(id, sectionData) {
    return await apiService.makeRequest('/dynamic-sections', {
      method: 'PUT',
      body: JSON.stringify({ id, ...sectionData })
    });
  }

  // Delete section (authenticated)
  async deleteSection(id) {
    return await apiService.makeRequest(`/dynamic-sections?id=${id}`, {
      method: 'DELETE'
    });
  }

  // Reorder sections (authenticated)
  async reorderSections(sections) {
    return await apiService.makeRequest('/dynamic-sections/reorder', {
      method: 'POST',
      body: JSON.stringify({ sections })
    });
  }

  // Get sections for positioning dropdown (authenticated)
  async getSectionsForPositioning() {
    return await apiService.makeRequest('/dynamic-sections/positioning', {
      method: 'GET'
    });
  }
}

export const dynamicSectionService = new DynamicSectionService();


