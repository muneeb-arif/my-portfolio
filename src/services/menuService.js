import { apiService } from './apiService';
import { API_BASE } from '../utils/apiConfig';

class MenuService {
  // List all menus (public API - returns only visible menus for location)
  async listMenus(location = null) {
    try {
      const url = location 
        ? `${API_BASE}/menus?location=${location}`
        : `${API_BASE}/menus`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error listing menus:', error);
      return { success: false, error: error.message };
    }
  }

  // Get menus by location (header, footer, mobile)
  async getMenusByLocation(location) {
    return this.listMenus(location);
  }

  // Get single menu by ID
  async getMenu(id) {
    try {
      const response = await fetch(`${API_BASE}/menus?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting menu:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new menu (authenticated)
  async createMenu(menuData) {
    return await apiService.makeRequest('/menus', {
      method: 'POST',
      body: JSON.stringify(menuData)
    });
  }

  // Update menu (authenticated)
  async updateMenu(id, menuData) {
    return await apiService.makeRequest(`/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuData)
    });
  }

  // Delete menu (authenticated)
  async deleteMenu(id) {
    return await apiService.makeRequest(`/menus/${id}`, {
      method: 'DELETE'
    });
  }

  // Reorder menus (authenticated)
  async reorderMenus(menus) {
    return await apiService.makeRequest('/menus/reorder', {
      method: 'POST',
      body: JSON.stringify({ menus })
    });
  }

  // Get sections for menu dropdown (authenticated)
  async getSectionsForMenu() {
    return await apiService.makeRequest('/menus/sections', {
      method: 'GET'
    });
  }
}

export const menuService = new MenuService();

