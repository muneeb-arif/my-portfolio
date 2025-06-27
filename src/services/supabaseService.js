import { supabase, TABLES, BUCKETS } from '../config/supabase';
import { fallbackDataService } from './fallbackDataService';
import { fallbackUtils } from '../utils/fallbackUtils';

// ================ AUTH OPERATIONS ================

export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData // Additional user metadata
        }
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser() {
    return supabase.auth.getUser();
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  }
};

// ================ PROJECT OPERATIONS ================

export const projectService = {
  // Get all projects for current user
  async getProjects() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .select(`
          *,
          project_images (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects from Supabase, using fallback data:', error);
      // Show fallback notification
      fallbackUtils.showFallbackNotification();
      // Return fallback data when Supabase fails
      return fallbackDataService.getProjects();
    }
  },

  // Get single project
  async getProject(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .select(`
          *,
          project_images (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Create new project
  async createProject(projectData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .insert({
          ...projectData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update project
  async updateProject(id, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete project
  async deleteProject(id) {
    try {
      const { error } = await supabase
        .from(TABLES.PROJECTS)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Subscribe to project changes (real-time)
  subscribeToProjects(callback) {
    return supabase
      .channel('projects')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES.PROJECTS 
        }, 
        callback
      )
      .subscribe();
  }
};

// ================ IMAGE OPERATIONS ================

export const imageService = {
  // Upload single image
  async uploadImage(file, bucket = BUCKETS.IMAGES) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}_${file.name}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        id: timestamp.toString(),
        url: publicUrl,
        path: uploadData.path,
        name: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        bucket: bucket
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Upload multiple images
  async uploadImages(files, bucket = BUCKETS.IMAGES) {
    try {
      const uploadPromises = Array.from(files).map(file => 
        this.uploadImage(file, bucket)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  },

  // Delete image
  async deleteImage(imagePath, bucket = BUCKETS.IMAGES) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([imagePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  // Save image metadata to database
  async saveImageMetadata(projectId, imageData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.IMAGES)
        .insert({
          project_id: projectId,
          user_id: user.id,
          url: imageData.url,
          path: imageData.path,
          name: imageData.name,
          original_name: imageData.originalName,
          size: imageData.size,
          type: imageData.type,
          bucket: imageData.bucket
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving image metadata:', error);
      throw error;
    }
  },

  // Upload project image (combines upload + metadata save)
  async uploadProjectImage(projectId, file) {
    try {
      // First upload the image to storage
      const imageData = await this.uploadImage(file);
      
      // Then save metadata to database
      const metadata = await this.saveImageMetadata(projectId, imageData);
      
      return {
        ...imageData,
        metadata
      };
    } catch (error) {
      console.error('Error uploading project image:', error);
      throw error;
    }
  }
};

// ================ SETTINGS OPERATIONS ================

export const settingsService = {
  // Get all settings for a user
  async getSettings() {
    try {
      console.log('🔍 Getting user from auth...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user found');
        throw new Error('Not authenticated');
      }
      console.log('✅ User authenticated:', user.id);

      console.log('🔍 Fetching settings from database...');
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      console.log('📊 Raw settings data:', data);
      
      // Convert array to object for easier access
      const settingsObj = {};
      (data || []).forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      
      console.log('🔧 Processed settings object:', settingsObj);
      return settingsObj;
    } catch (error) {
      console.error('❌ Error in getSettings:', error);
      return {};
    }
  },

  // Get a specific setting
  async getSetting(key) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', key)
        .single();

      if (error) throw error;
      return data?.value || null;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  },

  // Update or create a setting
  async updateSetting(key, value) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          key: key,
          value: value
        }, { onConflict: 'user_id,key' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  },

  // Update multiple settings at once
  async updateMultipleSettings(settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const settingsData = Object.entries(settings).map(([key, value]) => ({
        user_id: user.id,
        key: key,
        value: value
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(settingsData, { onConflict: 'user_id,key' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      throw error;
    }
  },

  // Delete a setting
  async deleteSetting(key) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('user_id', user.id)
        .eq('key', key);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting setting ${key}:`, error);
      throw error;
    }
  },

  // Get default appearance settings
  getDefaultAppearanceSettings() {
    return {
      logo_type: 'initials', // 'initials' or 'image'
      logo_initials: 'MA',
      logo_image: '',
      hero_banner_image: '/images/hero-bg.png',
      avatar_image: '/images/profile/avatar.jpeg',
      banner_name: 'Muneeb Arif',
      banner_title: 'Principal Software Engineer',
      banner_tagline: 'I craft dreams, not projects.',
      resume_file: '/images/profile/principal-software-engineer-muneeb.resume.pdf',
      social_email: 'muneeb@example.com',
      social_github: 'https://github.com/muneebarif',
      social_instagram: '',
      social_facebook: '',
      copyright_text: '© 2024 Muneeb Arif. All rights reserved.'
    };
  }
};

// ================ CATEGORIES & TECHNOLOGIES ================

export const metaService = {
  // Get categories (global categories, no user filtering)
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories from Supabase, using fallback data:', error);
      // Show fallback notification
      fallbackUtils.showFallbackNotification();
      // Return fallback data when Supabase fails
      return fallbackDataService.getCategories();
    }
  },

  // Add category (global category, no user association)
  async addCategory(category) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .insert(category) // Don't add user_id
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  // Update category
  async updateCategory(id, updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(id) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First check if any projects use this category
      const { data: projectsUsingCategory, error: checkError } = await supabase
        .from(TABLES.PROJECTS)
        .select('id, title')
        .eq('category', id);
      
      if (checkError) throw checkError;
      
      if (projectsUsingCategory && projectsUsingCategory.length > 0) {
        throw new Error(`Cannot delete category. ${projectsUsingCategory.length} projects are using this category.`);
      }

      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Get technologies
  async getTechnologies() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.TECHNOLOGIES)
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching technologies:', error);
      throw error;
    }
  },

  // Add technology
  async addTechnology(technology) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.TECHNOLOGIES)
        .insert({
          ...technology,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding technology:', error);
      throw error;
    }
  }
};

// ================ DOMAINS & TECHNOLOGIES OPERATIONS ================

export const domainsTechnologiesService = {
  // Get all domains and technologies
  async getDomainsTechnologies() {
    try {
      const { data, error } = await supabase
        .from('domains_technologies')
        .select(`
          *,
          tech_skills (*)
        `)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching domains/technologies from Supabase, using fallback data:', error);
      // Show fallback notification
      fallbackUtils.showFallbackNotification();
      // Return fallback data when Supabase fails
      return fallbackDataService.getTechnologies();
    }
  },

  // Get domains only
  async getDomains() {
    try {
      const { data, error } = await supabase
        .from('domains_technologies')
        .select(`
          *,
          tech_skills (*)
        `)
        .eq('type', 'domain')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching domains from Supabase, using fallback data:', error);
      // Show fallback notification
      fallbackUtils.showFallbackNotification();
      // Return fallback data when Supabase fails
      return fallbackDataService.getTechnologies().filter(item => item.type === 'domain');
    }
  },

  // Get technologies only
  async getTechnologies() {
    try {
      const { data, error } = await supabase
        .from('domains_technologies')
        .select(`
          *,
          tech_skills (*)
        `)
        .eq('type', 'technology')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching technologies from Supabase, using fallback data:', error);
      // Show fallback notification
      fallbackUtils.showFallbackNotification();
      // Return fallback data when Supabase fails
      return fallbackDataService.getTechnologies().filter(item => item.type === 'technology');
    }
  },

  // Create new domain or technology
  async createDomainTechnology(itemData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('domains_technologies')
        .insert({
          ...itemData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating domain/technology:', error);
      throw error;
    }
  },

  // Update domain or technology
  async updateDomainTechnology(id, updates) {
    try {
      const { data, error } = await supabase
        .from('domains_technologies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating domain/technology:', error);
      throw error;
    }
  },

  // Delete domain or technology
  async deleteDomainTechnology(id) {
    try {
      const { error } = await supabase
        .from('domains_technologies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting domain/technology:', error);
      throw error;
    }
  },

  // Add skill to technology
  async addSkill(techId, skillData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tech_skills')
        .insert({
          ...skillData,
          tech_id: techId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  },

  // Update skill
  async updateSkill(id, updates) {
    try {
      const { data, error } = await supabase
        .from('tech_skills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  },

  // Delete skill
  async deleteSkill(id) {
    try {
      const { error } = await supabase
        .from('tech_skills')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  }
};

// ================ BULK OPERATIONS ================

export const bulkService = {
  // Export all user data
  async exportData() {
    try {
      const [projects, settings, categories, technologies] = await Promise.all([
        projectService.getProjects(),
        settingsService.getSettings(),
        metaService.getCategories(),
        metaService.getTechnologies()
      ]);

      return {
        projects,
        settings,
        categories,
        technologies,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  // Import data
  async importData(data) {
    try {
      const results = {
        projects: 0,
        categories: 0,
        technologies: 0,
        errors: []
      };

      // Import categories first (projects might reference them)
      if (data.categories) {
        for (const category of data.categories) {
          try {
            const { name, description, color } = category;
            await metaService.addCategory({ name, description, color });
            results.categories++;
          } catch (error) {
            results.errors.push(`Category "${category.name}": ${error.message}`);
          }
        }
      }

      // Import technologies
      if (data.technologies) {
        for (const tech of data.technologies) {
          try {
            const { name, description, icon } = tech;
            await metaService.addTechnology({ name, description, icon });
            results.technologies++;
          } catch (error) {
            results.errors.push(`Technology "${tech.name}": ${error.message}`);
          }
        }
      }

      // Import projects
      if (data.projects) {
        for (const project of data.projects) {
          try {
            const { 
              title, 
              description, 
              category, 
              overview, 
              technologies, 
              features, 
              live_url, 
              github_url 
            } = project;
            
            await projectService.createProject({
              title,
              description,
              category,
              overview,
              technologies,
              features,
              live_url,
              github_url
            });
            results.projects++;
          } catch (error) {
            results.errors.push(`Project "${project.title}": ${error.message}`);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
};

// ================ NICHE OPERATIONS ================

export const nicheService = {
  // Get all niches
  async getNiches() {
    try {
      const { data, error } = await supabase
        .from('niche')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching niches from Supabase, using fallback data:', error);
      // Show fallback notification
      fallbackUtils.showFallbackNotification();
      // Return fallback data when Supabase fails
      return fallbackDataService.getNiches();
    }
  },

  // Get single niche
  async getNiche(id) {
    try {
      const { data, error } = await supabase
        .from('niche')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching niche:', error);
      throw error;
    }
  },

  // Create new niche
  async createNiche(nicheData) {
    try {
      const { data, error } = await supabase
        .from('niche')
        .insert(nicheData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating niche:', error);
      throw error;
    }
  },

  // Update niche
  async updateNiche(id, updates) {
    try {
      const { data, error } = await supabase
        .from('niche')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating niche:', error);
      throw error;
    }
  },

  // Delete niche
  async deleteNiche(id) {
    try {
      const { error } = await supabase
        .from('niche')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting niche:', error);
      throw error;
    }
  },

  // Subscribe to niche changes (real-time)
  subscribeToNiches(callback) {
    return supabase
      .channel('niches')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'niche' 
        }, 
        callback
      )
      .subscribe();
  }
}; 