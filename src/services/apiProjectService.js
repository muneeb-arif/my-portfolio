// API-based project service to replace direct Supabase calls
import { apiAuthService } from './apiAuthService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiProjectService {
  // Make authenticated API request
  async makeRequest(endpoint, options = {}) {
    return await apiAuthService.makeAuthenticatedRequest(endpoint, options);
  }

  // Get all projects for current user
  async getProjects() {
    try {
      const result = await this.makeRequest('/api/dashboard/projects');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get single project
  async getProject(id) {
    try {
      const result = await this.makeRequest(`/api/dashboard/projects/${id}`);
      return result.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Create new project
  async createProject(projectData) {
    try {
      const result = await this.makeRequest('/api/dashboard/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });
      return result.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update existing project
  async updateProject(id, updates) {
    try {
      const result = await this.makeRequest(`/api/dashboard/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return result.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(id) {
    try {
      const result = await this.makeRequest(`/api/dashboard/projects/${id}`, {
        method: 'DELETE'
      });
      return result;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Upload project images
  async uploadProjectImages(projectId, files) {
    try {
      const formData = new FormData();
      
      // Add files to form data
      if (Array.isArray(files)) {
        files.forEach(file => {
          formData.append('images', file);
        });
      } else {
        formData.append('images', files);
      }

      const token = apiAuthService.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/dashboard/projects/${projectId}/images`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }

  // Delete project image
  async deleteProjectImage(imageId) {
    try {
      const result = await this.makeRequest(`/api/dashboard/images/${imageId}`, {
        method: 'DELETE'
      });
      return result;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Get project images
  async getProjectImages(projectId) {
    try {
      const result = await this.makeRequest(`/api/dashboard/projects/${projectId}/images`);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching project images:', error);
      throw error;
    }
  }

  // Subscribe to projects changes (placeholder for real-time updates)
  subscribeToProjects(callback) {
    // For now, just return a dummy unsubscribe function
    // In a real implementation, you might use WebSockets or Server-Sent Events
    console.log('Project subscription started (placeholder)');
    
    return () => {
      console.log('Project subscription ended (placeholder)');
    };
  }
}

// Create and export singleton instance
export const apiProjectService = new ApiProjectService();
export default apiProjectService; 