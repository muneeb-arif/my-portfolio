// Hybrid Service - Switches between API and Supabase based on configuration
// Images always use Supabase, data can use either API or Supabase

import { supabase } from '../config/supabase';
import { apiService } from './apiService';
import { fallbackDataService } from './fallbackDataService';
import { fallbackUtils } from '../utils/fallbackUtils';

class HybridService {
  constructor() {
    this.useApi = process.env.REACT_APP_USE_API_SERVICE === 'true';
    this.apiUrl = process.env.REACT_APP_API_URL;
    this.isInitialized = false;
    
    console.log('🔧 Hybrid Service initialized:', {
      useApi: this.useApi,
      apiUrl: this.apiUrl
    });
  }

  // Initialize the service
  async initialize() {
    if (this.isInitialized) return;

    if (this.useApi) {
      // Test API connection
      const apiAvailable = await apiService.testConnection();
      if (!apiAvailable) {
        console.warn('⚠️ API not available, falling back to Supabase');
        this.useApi = false;
      } else {
        console.log('✅ API service available and ready');
      }
    }

    this.isInitialized = true;
  }

  // ================ AUTHENTICATION ================

  async register(email, password) {
    await this.initialize();
    
    if (this.useApi) {
      return await apiService.register(email, password);
    } else {
      // Use Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    }
  }

  async login(email, password) {
    await this.initialize();
    
    if (this.useApi) {
      return await apiService.login(email, password);
    } else {
      // Use Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    }
  }

  async logout() {
    if (this.useApi) {
      apiService.clearToken();
    } else {
      await supabase.auth.signOut();
    }
  }

  // ================ PROJECTS ================

  async getPublishedProjects() {
    await this.initialize();
    
    try {
      if (this.useApi) {
        const response = await apiService.getPublishedProjects();
        return this.transformApiProjects(response.data || []);
      } else {
        // Use Supabase
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_images(*)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return this.transformSupabaseProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      return this.transformFallbackProjects(fallbackDataService.getProjects());
    }
  }

  async getUserProjects() {
    await this.initialize();
    
    try {
      if (this.useApi) {
        const response = await apiService.getUserProjects();
        return this.transformApiProjects(response.data || []);
      } else {
        // Use Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_images(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return this.transformSupabaseProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }
  }

  async createProject(projectData) {
    await this.initialize();
    
    try {
      if (this.useApi) {
        const response = await apiService.createProject(projectData);
        return response;
      } else {
        // Use Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...projectData,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(projectId, projectData) {
    await this.initialize();
    
    try {
      if (this.useApi) {
        return await apiService.updateProject(projectId, projectData);
      } else {
        // Use Supabase
        const { data, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(projectId) {
    await this.initialize();
    
    try {
      if (this.useApi) {
        return await apiService.deleteProject(projectId);
      } else {
        // Use Supabase
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);

        if (error) throw error;
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // ================ IMAGES (ALWAYS SUPABASE) ================

  async uploadProjectImage(file, projectId) {
    try {
      const fileName = `${projectId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase
        .from('project_images')
        .insert({
          project_id: projectId,
          user_id: user.id,
          url: publicUrl,
          path: fileName,
          name: file.name,
          original_name: file.name,
          size: file.size,
          type: file.type
        });

      if (dbError) throw dbError;

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteProjectImage(imageId) {
    try {
      // Get image info
      const { data: image, error: fetchError } = await supabase
        .from('project_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-images')
        .remove([image.path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // ================ SETTINGS ================

  async getSettings() {
    await this.initialize();
    
    try {
      if (this.useApi) {
        const response = await apiService.getSettings();
        return response.data || {};
      } else {
        // Use Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        // Convert to object
        const settingsObj = {};
        (data || []).forEach(setting => {
          try {
            settingsObj[setting.key] = JSON.parse(setting.value);
          } catch (error) {
            settingsObj[setting.key] = setting.value;
          }
        });

        return settingsObj;
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    }
  }

  async updateSettings(settingsData) {
    await this.initialize();
    
    try {
      if (this.useApi) {
        return await apiService.updateSettings(settingsData);
      } else {
        // Use Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const settingsArray = Object.entries(settingsData).map(([key, value]) => ({
          user_id: user.id,
          key,
          value: JSON.stringify(value)
        }));

        const { error } = await supabase
          .from('settings')
          .upsert(settingsArray, { onConflict: 'user_id,key' });

        if (error) throw error;
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  // ================ DATA TRANSFORMATION ================

  transformApiProjects(projects) {
    return projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category || 'Web Development',
      image: project.project_images?.[0]?.url || '/images/domains/default.jpeg',
      buttonText: 'View Details',
      details: {
        overview: project.overview || project.description,
        technologies: Array.isArray(project.technologies) ? project.technologies : [],
        features: Array.isArray(project.features) ? project.features : [],
        liveUrl: project.live_url || '#',
        githubUrl: project.github_url || '#',
        images: project.project_images?.map(img => ({
          url: img.url,
          caption: null
        })) || []
      }
    }));
  }

  transformSupabaseProjects(projects) {
    return projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category || 'Web Development',
      image: project.project_images?.[0]?.url || '/images/domains/default.jpeg',
      buttonText: 'View Details',
      details: {
        overview: project.overview || project.description,
        technologies: Array.isArray(project.technologies) ? project.technologies : [],
        features: Array.isArray(project.features) ? project.features : [],
        liveUrl: project.live_url || '#',
        githubUrl: project.github_url || '#',
        images: project.project_images?.map(img => ({
          url: img.url,
          caption: null
        })) || []
      }
    }));
  }

  transformFallbackProjects(projects) {
    return projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category || 'Web Development',
      image: project.image || '/images/domains/default.jpeg',
      buttonText: 'View Details',
      details: {
        overview: project.overview || project.description,
        technologies: project.technologies || [],
        features: project.features || [],
        liveUrl: project.liveUrl || '#',
        githubUrl: project.githubUrl || '#',
        images: project.images || []
      }
    }));
  }

  // ================ UTILITY METHODS ================

  getCurrentMode() {
    return this.useApi ? 'API' : 'Supabase';
  }

  async switchMode(useApi) {
    this.useApi = useApi;
    this.isInitialized = false;
    await this.initialize();
    console.log(`🔄 Switched to ${this.getCurrentMode()} mode`);
  }
}

// Create singleton instance
export const hybridService = new HybridService();

// Export for use in other services
export default hybridService; 