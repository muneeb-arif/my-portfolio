// Service adapter for seamless switching between Supabase and API services
import { authService as supabaseAuthService } from './supabaseService';
import { projectService as supabaseProjectService } from './supabaseService';
import { metaService as supabaseMetaService } from './supabaseService';
import { nicheService as supabaseNicheService } from './supabaseService';
import { settingsService as supabaseSettingsService } from './supabaseService';
import { domainsTechnologiesService as supabaseDomainsTechService } from './supabaseService';
import { getContactQueries, updateQueryStatus } from './supabaseService';

import { apiAuthService } from './apiAuthService';
import { apiProjectService } from './apiProjectService';
import { apiDashboardService } from './apiDashboardService';
import { apiPortfolioService } from './apiPortfolioService';

// Import API configuration override
import API_CONFIG from '../config/apiConfig';

// Configuration flags - FORCE API SERVICE USAGE
const USE_API_SERVICE = API_CONFIG.USE_API_SERVICE || process.env.REACT_APP_USE_API_SERVICE === 'true';
const ENABLE_HYBRID_MODE = API_CONFIG.ENABLE_HYBRID_MODE || process.env.REACT_APP_ENABLE_HYBRID_MODE === 'true';

console.log('🔧 Service Adapter Configuration:', {
  USE_API_SERVICE,
  ENABLE_HYBRID_MODE,
  API_URL: process.env.REACT_APP_API_URL || API_CONFIG.API_URL,
  FORCED_API_MODE: API_CONFIG.USE_API_SERVICE
});

// ================ AUTHENTICATION SERVICE ADAPTER ================

export const authService = {
  async signUp(email, password, userData = {}) {
    if (USE_API_SERVICE) {
      return await apiAuthService.signUp(email, password, userData);
    }
    return await supabaseAuthService.signUp(email, password, userData);
  },

  async signIn(email, password) {
    if (USE_API_SERVICE) {
      return await apiAuthService.signIn(email, password);
    }
    return await supabaseAuthService.signIn(email, password);
  },

  async signOut() {
    if (USE_API_SERVICE) {
      return await apiAuthService.signOut();
    }
    return await supabaseAuthService.signOut();
  },

  async getCurrentUser() {
    if (USE_API_SERVICE) {
      return await apiAuthService.getCurrentUser();
    }
    return await supabaseAuthService.getCurrentUser();
  },

  onAuthStateChange(callback) {
    if (USE_API_SERVICE) {
      return apiAuthService.onAuthStateChange(callback);
    }
    return supabaseAuthService.onAuthStateChange(callback);
  },

  async resetPassword(email) {
    if (USE_API_SERVICE) {
      return await apiAuthService.resetPassword(email);
    }
    return await supabaseAuthService.resetPassword(email);
  }
};

// ================ PROJECT SERVICE ADAPTER ================

export const projectService = {
  async getProjects() {
    if (USE_API_SERVICE) {
      try {
        return await apiProjectService.getProjects();
      } catch (error) {
        console.warn('🔄 API service failed, falling back to Supabase:', error.message);
        if (ENABLE_HYBRID_MODE) {
          return await supabaseProjectService.getProjects();
        }
        throw error;
      }
    }
    return await supabaseProjectService.getProjects();
  },

  async getProject(id) {
    if (USE_API_SERVICE) {
      try {
        return await apiProjectService.getProject(id);
      } catch (error) {
        if (ENABLE_HYBRID_MODE) {
          return await supabaseProjectService.getProject(id);
        }
        throw error;
      }
    }
    return await supabaseProjectService.getProject(id);
  },

  async createProject(projectData) {
    if (USE_API_SERVICE) {
      return await apiProjectService.createProject(projectData);
    }
    return await supabaseProjectService.createProject(projectData);
  },

  async updateProject(id, updates) {
    if (USE_API_SERVICE) {
      return await apiProjectService.updateProject(id, updates);
    }
    return await supabaseProjectService.updateProject(id, updates);
  },

  async deleteProject(id) {
    if (USE_API_SERVICE) {
      return await apiProjectService.deleteProject(id);
    }
    return await supabaseProjectService.deleteProject(id);
  },

  // Image operations
  async uploadProjectImages(projectId, files) {
    if (USE_API_SERVICE) {
      return await apiProjectService.uploadProjectImages(projectId, files);
    }
    // Fallback to existing Supabase image upload
    throw new Error('Supabase image upload not implemented in adapter');
  },

  async deleteProjectImage(imageId) {
    if (USE_API_SERVICE) {
      return await apiProjectService.deleteProjectImage(imageId);
    }
    throw new Error('Supabase image deletion not implemented in adapter');
  },

  subscribeToProjects(callback) {
    if (USE_API_SERVICE) {
      return apiProjectService.subscribeToProjects(callback);
    }
    return supabaseProjectService.subscribeToProjects(callback);
  }
};

// ================ CATEGORIES SERVICE ADAPTER ================

export const metaService = {
  async getCategories() {
    if (USE_API_SERVICE) {
      try {
        return await apiDashboardService.getCategories();
      } catch (error) {
        if (ENABLE_HYBRID_MODE) {
          return await supabaseMetaService.getCategories();
        }
        throw error;
      }
    }
    return await supabaseMetaService.getCategories();
  },

  async addCategory(categoryData) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.addCategory(categoryData);
    }
    return await supabaseMetaService.addCategory(categoryData);
  },

  async updateCategory(id, updates) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.updateCategory(id, updates);
    }
    return await supabaseMetaService.updateCategory(id, updates);
  },

  async deleteCategory(id) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.deleteCategory(id);
    }
    return await supabaseMetaService.deleteCategory(id);
  }
};

// ================ DOMAINS & TECHNOLOGIES SERVICE ADAPTER ================

export const domainsTechnologiesService = {
  async getDomainsTechnologies() {
    if (USE_API_SERVICE) {
      try {
        return await apiDashboardService.getDomainsTechnologies();
      } catch (error) {
        if (ENABLE_HYBRID_MODE) {
          return await supabaseDomainsTechService.getDomainsTechnologies();
        }
        throw error;
      }
    }
    return await supabaseDomainsTechService.getDomainsTechnologies();
  },

  async createDomainTechnology(itemData) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.createDomainTechnology(itemData);
    }
    return await supabaseDomainsTechService.createDomainTechnology(itemData);
  },

  async updateDomainTechnology(id, updates) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.updateDomainTechnology(id, updates);
    }
    return await supabaseDomainsTechService.updateDomainTechnology(id, updates);
  },

  async deleteDomainTechnology(id) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.deleteDomainTechnology(id);
    }
    return await supabaseDomainsTechService.deleteDomainTechnology(id);
  },

  async addSkill(techId, skillData) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.addSkill(techId, skillData);
    }
    return await supabaseDomainsTechService.addSkill(techId, skillData);
  },

  async updateSkill(id, updates) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.updateSkill(id, updates);
    }
    return await supabaseDomainsTechService.updateSkill(id, updates);
  },

  async deleteSkill(id) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.deleteSkill(id);
    }
    return await supabaseDomainsTechService.deleteSkill(id);
  },

  // Legacy method mappings for compatibility
  async getDomains() {
    const items = await this.getDomainsTechnologies();
    return items.filter(item => item.type === 'domain');
  },

  async getTechnologies() {
    const items = await this.getDomainsTechnologies();
    return items.filter(item => item.type === 'technology');
  }
};

// ================ NICHES SERVICE ADAPTER ================

export const nicheService = {
  async getNiches() {
    if (USE_API_SERVICE) {
      try {
        return await apiDashboardService.getNiches();
      } catch (error) {
        if (ENABLE_HYBRID_MODE) {
          return await supabaseNicheService.getNiches();
        }
        throw error;
      }
    }
    return await supabaseNicheService.getNiches();
  },

  async createNiche(nicheData) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.createNiche(nicheData);
    }
    return await supabaseNicheService.createNiche(nicheData);
  },

  async updateNiche(id, updates) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.updateNiche(id, updates);
    }
    return await supabaseNicheService.updateNiche(id, updates);
  },

  async deleteNiche(id) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.deleteNiche(id);
    }
    return await supabaseNicheService.deleteNiche(id);
  },

  subscribeToNiches(callback) {
    if (USE_API_SERVICE) {
      return apiDashboardService.subscribeToNiches(callback);
    }
    return supabaseNicheService.subscribeToNiches(callback);
  }
};

// ================ SETTINGS SERVICE ADAPTER ================

export const settingsService = {
  async getSettings() {
    if (USE_API_SERVICE) {
      try {
        return await apiDashboardService.getSettings();
      } catch (error) {
        if (ENABLE_HYBRID_MODE) {
          return await supabaseSettingsService.getSettings();
        }
        throw error;
      }
    }
    return await supabaseSettingsService.getSettings();
  },

  async getSetting(key) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.getSetting(key);
    }
    return await supabaseSettingsService.getSetting(key);
  },

  async updateSetting(key, value) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.updateSetting(key, value);
    }
    return await supabaseSettingsService.updateSetting(key, value);
  },

  async updateMultipleSettings(settings) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.updateMultipleSettings(settings);
    }
    return await supabaseSettingsService.updateMultipleSettings(settings);
  },

  async deleteSetting(key) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.deleteSetting(key);
    }
    return await supabaseSettingsService.deleteSetting(key);
  },

  getDefaultAppearanceSettings() {
    if (USE_API_SERVICE) {
      return apiDashboardService.getDefaultAppearanceSettings();
    }
    return supabaseSettingsService.getDefaultAppearanceSettings();
  }
};

// ================ CONTACT QUERIES SERVICE ADAPTER ================

export const contactQueriesService = {
  async getContactQueries() {
    if (USE_API_SERVICE) {
      return await apiDashboardService.getContactQueries();
    }
    return await getContactQueries();
  },

  async updateQueryStatus(queryId, status, notes = null) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.updateQueryStatus(queryId, status, notes);
    }
    return await updateQueryStatus(queryId, status, notes);
  }
};

// ================ PUBLIC PORTFOLIO SERVICE ================

export const publicPortfolioService = {
  async getPublishedProjects() {
    if (USE_API_SERVICE) {
      try {
        return await apiPortfolioService.getPublishedProjects();
      } catch (error) {
        if (ENABLE_HYBRID_MODE) {
          // Fallback to existing public service
          const { publicService } = await import('./supabaseService');
          return await publicService.getPublishedProjects();
        }
        throw error;
      }
    }
    const { publicService } = await import('./supabaseService');
    return await publicService.getPublishedProjects();
  },

  async getCategories() {
    if (USE_API_SERVICE) {
      return await apiPortfolioService.getCategories();
    }
    const { publicService } = await import('./supabaseService');
    return await publicService.getCategories();
  },

  async getDomainsTechnologies() {
    if (USE_API_SERVICE) {
      return await apiPortfolioService.getDomainsTechnologies();
    }
    const { publicService } = await import('./supabaseService');
    return await publicService.getDomainsTechnologies();
  },

  async getNiches() {
    if (USE_API_SERVICE) {
      return await apiPortfolioService.getNiches();
    }
    const { publicService } = await import('./supabaseService');
    return await publicService.getNiches();
  },

  async getPublicSettings() {
    if (USE_API_SERVICE) {
      return await apiPortfolioService.getPublicSettings();
    }
    const { publicService } = await import('./supabaseService');
    return await publicService.getPublicSettings();
  },

  async getContactQueries() {
    if (USE_API_SERVICE) {
      return await apiDashboardService.getContactQueries();
    }
    return await getContactQueries();
  },

  async updateQueryStatus(queryId, status, notes = null) {
    if (USE_API_SERVICE) {
      return await apiDashboardService.updateQueryStatus(queryId, status, notes);
    }
    return await updateQueryStatus(queryId, status, notes);
  }
};

// ================ UTILITY FUNCTIONS ================

export const switchToApiService = () => {
  console.log('🔄 Switching to API service mode');
  // In a real implementation, you might want to update localStorage
  // or trigger a app-wide state update
};

export const switchToSupabaseService = () => {
  console.log('🔄 Switching to Supabase service mode');
};

export const getServiceMode = () => {
  return USE_API_SERVICE ? 'api' : 'supabase';
};

// ================ EXPORTS ================

// Export all adapted services
export default {
  authService,
  projectService,
  metaService,
  domainsTechnologiesService,
  nicheService,
  settingsService,
  contactQueriesService,
  publicPortfolioService,
  
  // Utility functions
  switchToApiService,
  switchToSupabaseService,
  getServiceMode
}; 