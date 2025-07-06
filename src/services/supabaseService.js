import { supabase, TABLES, BUCKETS } from '../config/supabase';
import { fallbackDataService } from './fallbackDataService';
import { fallbackUtils } from '../utils/fallbackUtils';
import { getCurrentUser } from './authUtils';
import { getPortfolioConfig, getSiteUrl } from './portfolioConfigUtils';

// ================ AUTH OPERATIONS ================

// Helper function to get site URL from database settings
const getSiteUrlFromSettings = async () => {
  return await getSiteUrl();
};

export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      // Get the site URL from database settings
      const siteUrl = await getSiteUrlFromSettings();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // Additional user metadata
          emailRedirectTo: `${siteUrl}/dashboard?verified=true`
        }
      });
      
      if (error) throw error;
      
      // Auto-insert new user into portfolio_config table with active state
      if (data.user && data.user.id) {
        try {
          console.log('🔄 Auto-configuring portfolio for new user:', email);
          const { error: configError } = await supabase
            .from('portfolio_config')
            .insert({
              owner_email: email,
              owner_user_id: data.user.id,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (configError) {
            console.warn('⚠️ Failed to auto-configure portfolio:', configError.message);
            // Don't fail the signup if portfolio config fails
          } else {
            console.log('✅ Portfolio automatically configured for new user');
          }
        } catch (configError) {
          console.warn('⚠️ Error during portfolio auto-configuration:', configError);
          // Continue with successful signup even if portfolio config fails
        }
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      // console.error('Sign up error:', error);
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
      // console.error('Sign in error:', error);
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
      // console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    const user = await getCurrentUser();
    return { data: { user }, error: null };
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
      // Get the site URL from database settings
      const siteUrl = await getSiteUrlFromSettings();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/dashboard?reset=true`
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      // console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  }
};

// ================ PROJECT OPERATIONS ================

export const projectService = {
  // Get all projects for current user
  async getProjects() {
    try {
      const user = await getCurrentUser();
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
      // console.error('Error fetching projects from Supabase, using fallback data:', error);
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
      // console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Create new project
  async createProject(projectData) {
    try {
      const user = await getCurrentUser();
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
      // console.error('Error creating project:', error);
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
      // console.error('Error updating project:', error);
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
      // console.error('Error deleting project:', error);
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
      const user = await getCurrentUser();
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
      // console.error('Error uploading image:', error);
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
      // console.error('Error uploading images:', error);
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
      // console.error('Error deleting image:', error);
      throw error;
    }
  },

  // Save image metadata to database
  async saveImageMetadata(projectId, imageData) {
    try {
      const user = await getCurrentUser();
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
      // console.error('Error saving image metadata:', error);
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
      // console.error('Error uploading project image:', error);
      throw error;
    }
  }
};

// ================ SETTINGS OPERATIONS ================

export const settingsService = {
  // Get all settings for a user
  async getSettings() {
    try {
      // console.log('🔍 Getting user from auth...');
      const user = await getCurrentUser();
      if (!user) {
      // console.log('❌ No authenticated user found');
        throw new Error('Not authenticated');
      }
      // console.log('✅ User authenticated:', user.id);

      // console.log('🔍 Fetching settings from database...');
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
      // console.error('❌ Database error:', error);
        throw error;
      }
      
      // console.log('📊 Raw settings data:', data);
      
      // Convert array to object for easier access and parse JSON values
      const settingsObj = {};
      (data || []).forEach(setting => {
        try {
          // Try to parse as JSON to restore original data types
          settingsObj[setting.key] = JSON.parse(setting.value);
        } catch (error) {
          // If parsing fails, use the raw value (for backwards compatibility)
          settingsObj[setting.key] = setting.value;
        }
      });
      
      // console.log('🔧 Processed settings object:', settingsObj);
      return settingsObj;
    } catch (error) {
      // console.error('❌ Error in getSettings:', error);
      return {};
    }
  },

  // Get a specific setting
  async getSetting(key) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', key)
        .single();

      if (error) throw error;
      
      try {
        // Try to parse as JSON to restore original data type
        return data?.value ? JSON.parse(data.value) : null;
      } catch (parseError) {
        // If parsing fails, return raw value (for backwards compatibility)
        return data?.value || null;
      }
    } catch (error) {
      // console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  },

  // Update or create a setting
  async updateSetting(key, value) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          key: key,
          value: JSON.stringify(value) // Store as JSON to preserve data types
        }, { onConflict: 'user_id,key' });

      if (error) throw error;
      return true;
    } catch (error) {
      // console.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  },

  // Update multiple settings at once
  async updateMultipleSettings(settings) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const settingsData = Object.entries(settings).map(([key, value]) => ({
        user_id: user.id,
        key: key,
        value: JSON.stringify(value) // Store as JSON to preserve data types
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(settingsData, { onConflict: 'user_id,key' });

      if (error) throw error;
      return true;
    } catch (error) {
      // console.error('Error updating multiple settings:', error);
      throw error;
    }
  },

  // Delete a setting
  async deleteSetting(key) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('user_id', user.id)
        .eq('key', key);

      if (error) throw error;
      return true;
    } catch (error) {
      // console.error(`Error deleting setting ${key}:`, error);
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
  // Get categories for authenticated user (dashboard mode)
  async getCategories() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .select('*')
        .eq('user_id', user.id)  // Filter by authenticated user
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      // console.error('Error fetching categories from Supabase, using fallback data:', error);
      // Show fallback notification
      fallbackUtils.showFallbackNotification();
      // Return fallback data when Supabase fails
      return fallbackDataService.getCategories();
    }
  },

  // Add category for authenticated user
  async addCategory(category) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .insert({
          ...category,
          user_id: user.id  // Add user_id to associate with current user
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      // console.error('Error adding category:', error);
      throw error;
    }
  },

  // Update category
  async updateCategory(id, updates) {
    try {
      const user = await getCurrentUser();
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
      // console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(id) {
    try {
      const user = await getCurrentUser();
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
      // console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Get technologies
  async getTechnologies() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.TECHNOLOGIES)
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      // console.error('Error fetching technologies:', error);
      throw error;
    }
  },

  // Add technology
  async addTechnology(technology) {
    try {
      const user = await getCurrentUser();
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
      // console.error('Error adding technology:', error);
      throw error;
    }
  }
};

// ================ DOMAINS & TECHNOLOGIES OPERATIONS ================

export const domainsTechnologiesService = {
  // Get all domains and technologies for authenticated user
  async getDomainsTechnologies() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('domains_technologies')
        .select(`
          *,
          tech_skills (*)
        `)
        .eq('user_id', user.id)  // Filter by authenticated user
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      // console.error('Error fetching domains/technologies from Supabase, using fallback data:', error);
      // Show fallback notification
      fallbackUtils.showFallbackNotification();
      // Return fallback data when Supabase fails
      return fallbackDataService.getTechnologies();
    }
  },

  // Get domains only for authenticated user
  async getDomains() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('domains_technologies')
        .select(`
          *,
          tech_skills (*)
        `)
        .eq('user_id', user.id)  // Filter by authenticated user
        .eq('type', 'domain')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      // console.error('Error fetching domains from Supabase, using fallback data:', error);
      // Show fallback notification
      fallbackUtils.showFallbackNotification();
      // Return fallback data when Supabase fails
      return fallbackDataService.getTechnologies().filter(item => item.type === 'domain');
    }
  },

  // Get technologies only for authenticated user
  async getTechnologies() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('domains_technologies')
        .select(`
          *,
          tech_skills (*)
        `)
        .eq('user_id', user.id)  // Filter by authenticated user
        .eq('type', 'technology')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      // console.error('Error fetching technologies from Supabase, using fallback data:', error);
      // Show fallback notification
      fallbackUtils.showFallbackNotification();
      // Return fallback data when Supabase fails
      return fallbackDataService.getTechnologies().filter(item => item.type === 'technology');
    }
  },

  // Create new domain or technology
  async createDomainTechnology(itemData) {
    try {
      const user = await getCurrentUser();
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
      // console.error('Error creating domain/technology:', error);
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
      // console.error('Error updating domain/technology:', error);
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
      // console.error('Error deleting domain/technology:', error);
      throw error;
    }
  },

  // Add skill to technology
  async addSkill(techId, skillData) {
    try {
      const user = await getCurrentUser();
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
      // console.error('Error adding skill:', error);
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
      // console.error('Error updating skill:', error);
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
      // console.error('Error deleting skill:', error);
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
      // console.error('Error exporting data:', error);
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
      // console.error('Error importing data:', error);
      throw error;
    }
  }
};

// ================ NICHE OPERATIONS ================

export const nicheService = {
  // Get all niches for authenticated user (dashboard mode)
  async getNiches() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('niche')
        .select('*')
        .eq('user_id', user.id)  // Filter by authenticated user
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      // console.error('Error fetching niches from Supabase, using fallback data:', error);
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
      // console.error('Error fetching niche:', error);
      throw error;
    }
  },

  // Create new niche for authenticated user
  async createNiche(nicheData) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('niche')
        .insert({
          ...nicheData,
          user_id: user.id  // Add user_id to associate with current user
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      // console.error('Error creating niche:', error);
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
      // console.error('Error updating niche:', error);
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
      // console.error('Error deleting niche:', error);
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

// ================ PORTFOLIO CONFIGURATION SERVICE ================
// Service to manage portfolio owner configuration

export const portfolioConfigService = {
  // Cache to avoid repeated configuration calls
  _configCache: null,
  _configPromise: null,
  _cachedEmail: null, // Track which email the cache is for

  // Configure portfolio owner in database
  async configurePortfolioOwner(email) {
    if (!email) {
      // console.log('📝 No email provided for portfolio configuration');
      return { success: false, message: 'No email provided' };
    }

    try {
      // console.log('🔧 Configuring portfolio owner:', email);

      // First, get the user ID for this email
      const { data: userId, error: userError } = await supabase
        .rpc('get_user_id_by_email', { user_email: email });

      if (userError) {
      // console.error('❌ Error getting user ID:', userError);
        return { success: false, message: `User lookup failed: ${userError.message}` };
      }

      if (!userId) {
      // console.error('❌ No user found with email:', email);
        return { success: false, message: `No user found with email: ${email}` };
      }

      // Configure the portfolio owner in the database
      const { data, error } = await supabase
        .from('portfolio_config')
        .upsert({
          owner_email: email,
          owner_user_id: userId,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'owner_email'
        })
        .select();

      if (error) {
      // console.error('❌ Error configuring portfolio owner:', error);
        return { success: false, message: `Configuration failed: ${error.message}` };
      }

      // console.log('✅ Portfolio owner configured successfully:', data);
      
      // Clear cache after successful configuration
      this.clearCache();
      
      return { success: true, message: 'Portfolio owner configured successfully', data };

    } catch (error) {
      // console.error('❌ Error in configurePortfolioOwner:', error);
      return { success: false, message: `Configuration error: ${error.message}` };
    }
  },

  // Get portfolio configuration matching the EXACT email in .env (no fallbacks)
  async getPortfolioConfig() {
    return await getPortfolioConfig();
  },

  // Check if portfolio is configured and set it up if needed (with caching)
  async ensurePortfolioConfigured() {
    // Check if we have a cached email and if it matches current .env
    const { portfolioConfig } = await import('../config/portfolio');
    const currentEmail = portfolioConfig.ownerEmail;
    
    // Clear cache if email changed
    if (this._configCache && this._cachedEmail !== currentEmail) {
      // console.log('📧 Email changed from', this._cachedEmail, 'to', currentEmail, '- clearing cache');
      this.clearCache();
      // Also clear public portfolio cache
      publicPortfolioService.clearCache();
    }
    
    // Return cached result if available and email matches
    if (this._configCache && this._cachedEmail === currentEmail) {
      return this._configCache;
    }

    // Return existing promise if already in progress
    if (this._configPromise) {
      return this._configPromise;
    }

    // Create new promise and cache it
    this._configPromise = this._doEnsurePortfolioConfigured();
    
    try {
      const result = await this._configPromise;
      // Cache successful results for 5 minutes
      if (result.success) {
        this._configCache = result;
        this._cachedEmail = currentEmail; // Store the email this cache is for
        setTimeout(() => {
          this._configCache = null;
          this._cachedEmail = null;
        }, 5 * 60 * 1000); // 5 minutes
      }
      return result;
    } finally {
      this._configPromise = null;
    }
  },

  // Internal implementation without caching
  async _doEnsurePortfolioConfigured() {
    try {
      // Get the owner email from environment
      const { portfolioConfig } = await import('../config/portfolio');
      const envEmail = portfolioConfig.ownerEmail;

      if (!envEmail) {
      // console.log('📝 No portfolio owner email in .env');
        return { success: true, message: 'No configuration needed' };
      }

      // Check if .env email exists and is active in portfolio_config
      const existingConfig = await getPortfolioConfig();

      if (existingConfig) {
      // console.log('✅ .env email already configured:', envEmail);
        return { success: true, message: 'Already configured', config: existingConfig };
      }

      // If not found, create/activate it
      // console.log('🔧 Configuring portfolio for .env email:', envEmail);
      return await this.configurePortfolioOwner(envEmail);

    } catch (error) {
      // console.error('❌ Error ensuring portfolio configured:', error);
      return { success: false, message: `Setup error: ${error.message}` };
    }
  },

  // Clear cache (useful for testing or when configuration changes)
  clearCache() {
      // console.log('🗑️ Clearing portfolio config cache');
    this._configCache = null;
    this._configPromise = null;
    this._cachedEmail = null;
  }
};

// ================ USER RESOLUTION SERVICE ================
// Helper service to resolve user information

export const userResolutionService = {
  // Get user ID by email (for portfolio owner resolution)
  // This works by checking if there are any projects/data for a user with matching email
  async getUserIdByEmail(email) {
    if (!email) return null;
    
    try {
      // We can't directly query auth.users, but we can find users through their data
      // First, try to find via projects table (which has user_id and we can join with auth)
      const { data, error } = await supabase
        .rpc('get_user_id_by_email', { user_email: email });
      
      if (error) {
      // console.log('RPC function not available, falling back to alternative method');
        // Fallback: return null and let the app use fallback data
        return null;
      }
      
      return data;
    } catch (error) {
      // console.error('Error resolving user by email:', error);
      return null;
    }
  },

  // Get current authenticated user info
  async getCurrentUserInfo() {
    try {
      const user = await getCurrentUser();
      if (!user) return null;
      
      return {
        id: user.id,
        email: user.email
      };
    } catch (error) {
      // console.error('Error getting current user info:', error);
      return null;
    }
  }
};

// ================ PUBLIC PORTFOLIO OPERATIONS ================
// These functions fetch data for public display without authentication

export const publicPortfolioService = {
  // Cache for user resolution to avoid repeated calls
  _userIdCache: null,
  _isInitialized: false,
  
  // Data caches with timestamps
  _projectsCache: { data: null, timestamp: 0, promise: null },
  _categoriesCache: { data: null, timestamp: 0, promise: null },
  _domainsCache: { data: null, timestamp: 0, promise: null },
  _nichesCache: { data: null, timestamp: 0, promise: null },
  _settingsCache: { data: null, timestamp: 0, promise: null },
  
  // Cache duration: 10 seconds during initialization
  _cacheDuration: 10000,

  // Clear cache (call this when email changes)
  clearCache() {
      // console.log('🗑️ Clearing public portfolio cache');
    this._userIdCache = null;
    this._isInitialized = false;
    
    // Clear all data caches
    this._projectsCache = { data: null, timestamp: 0, promise: null };
    this._categoriesCache = { data: null, timestamp: 0, promise: null };
    this._domainsCache = { data: null, timestamp: 0, promise: null };
    this._nichesCache = { data: null, timestamp: 0, promise: null };
    this._settingsCache = { data: null, timestamp: 0, promise: null };
  },

  // Helper function to manage caching for API calls
  async _withCache(cacheKey, apiCall) {
    const cache = this[cacheKey];
    const now = Date.now();
    
    // Return cached result if fresh
    if (cache.data !== null && (now - cache.timestamp) < this._cacheDuration) {
      console.log(`📋 PUBLIC PORTFOLIO: Using cached ${cacheKey.replace('_', '').replace('Cache', '')}`);
      return cache.data;
    }
    
    // If there's already a pending request, wait for it
    if (cache.promise) {
      console.log(`📋 PUBLIC PORTFOLIO: Waiting for pending ${cacheKey.replace('_', '').replace('Cache', '')} request...`);
      return await cache.promise;
    }
    
    // Create new request
    console.log(`📋 PUBLIC PORTFOLIO: Making fresh ${cacheKey.replace('_', '').replace('Cache', '')} request...`);
    cache.promise = (async () => {
      try {
        const result = await apiCall();
        cache.data = result;
        cache.timestamp = now;
        return result;
      } catch (error) {
        // Don't cache errors, let them retry
        cache.data = null;
        cache.timestamp = 0;
        throw error;
      } finally {
        cache.promise = null;
      }
    })();
    
    return await cache.promise;
  },

  // Initialize configuration once
  async initialize() {
    if (this._isInitialized) {
      return;
    }

      // console.log('🚀 Initializing portfolio service...');
    
    try {
      // First, check if we're authenticated (dashboard mode)
      const currentUser = await userResolutionService.getCurrentUserInfo();
      if (currentUser) {
      // console.log('📊 Dashboard mode: Loading data for authenticated user:', currentUser.email);
        this._userIdCache = currentUser.id;
        this._isInitialized = true;
        return;
      }

      // For public mode, ensure portfolio is configured in the database
      // console.log('🌐 Public mode: Setting up portfolio configuration...');
      const setupResult = await portfolioConfigService.ensurePortfolioConfigured();
      
      if (setupResult.success) {
      // console.log('✅ Portfolio configuration ready');
      } else {
      // console.log('⚠️ Portfolio configuration failed:', setupResult.message);
      }
      
      // In public mode, we don't cache user ID - let RLS policies handle filtering
      this._userIdCache = null;
      this._isInitialized = true;

    } catch (error) {
      // console.error('❌ Error initializing portfolio service:', error);
      this._userIdCache = null;
      this._isInitialized = true;
    }
  },

  // Get published projects for public display
  async getPublishedProjects() {
    return await this._withCache('_projectsCache', async () => {
      try {
        // Initialize only once
        await this.initialize();
        
        // Get the user ID for the .env email
        const portfolioConfig = await portfolioConfigService.getPortfolioConfig();
        
        if (!portfolioConfig || !portfolioConfig.owner_user_id) {
        // console.log('⚠️ No portfolio config found, using fallback data');
          return fallbackDataService.getProjects();
        }

        // console.log('📊 Fetching projects for user ID:', portfolioConfig.owner_user_id);
        
        const { data, error } = await supabase
          .from(TABLES.PROJECTS)
          .select(`
            *,
            project_images (*)
          `)
          .eq('status', 'published')
          .eq('user_id', portfolioConfig.owner_user_id)  // ← NOW filtering by correct user!
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // console.log(`✅ Found ${data?.length || 0} projects for .env user`);
        return data || [];
      } catch (error) {
        // console.error('Error fetching published projects from Supabase, using fallback data:', error);
        // Show fallback notification
        fallbackUtils.showFallbackNotification();
        // Return fallback data when Supabase fails
        return fallbackDataService.getProjects();
      }
    });
  },

  // Get categories for public display
  async getCategories() {
    return await this._withCache('_categoriesCache', async () => {
      try {
        // Initialize only once
        await this.initialize();
        
        // Get the user ID for the .env email
        const portfolioConfig = await portfolioConfigService.getPortfolioConfig();
        
        if (!portfolioConfig || !portfolioConfig.owner_user_id) {
          // console.log('⚠️ No portfolio config found, using fallback data');
          return fallbackDataService.getCategories();
        }

        const { data, error } = await supabase
          .from(TABLES.CATEGORIES)
          .select('*')
          .eq('user_id', portfolioConfig.owner_user_id)  // ← NOW filtering by correct user!
          .order('name');

        if (error) throw error;
        return data || [];
      } catch (error) {
        // console.error('Error fetching categories from Supabase, using fallback data:', error);
        // Show fallback notification
        fallbackUtils.showFallbackNotification();
        // Return fallback data when Supabase fails
        return fallbackDataService.getCategories();
      }
    });
  },

  // Get domains and technologies for public display
  async getDomainsTechnologies() {
    return await this._withCache('_domainsCache', async () => {
      try {
        // Initialize only once
        await this.initialize();
        
        // Get the user ID for the .env email
        const portfolioConfig = await portfolioConfigService.getPortfolioConfig();
        
        if (!portfolioConfig || !portfolioConfig.owner_user_id) {
        // console.log('⚠️ No portfolio config found, using fallback data');
          return fallbackDataService.getTechnologies();
        }

        const { data, error } = await supabase
          .from('domains_technologies')
          .select(`
            *,
            tech_skills (*)
          `)
          .eq('user_id', portfolioConfig.owner_user_id)  // ← NOW filtering by correct user!
          .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        // console.error('Error fetching domains/technologies from Supabase, using fallback data:', error);
        // Show fallback notification
        fallbackUtils.showFallbackNotification();
        // Return fallback data when Supabase fails
        return fallbackDataService.getTechnologies();
      }
    });
  },

  // Get niches for public display
  async getNiches() {
    return await this._withCache('_nichesCache', async () => {
      try {
        // Initialize only once
        await this.initialize();
        
        // Get the user ID for the .env email
        const portfolioConfig = await portfolioConfigService.getPortfolioConfig();
        
        if (!portfolioConfig || !portfolioConfig.owner_user_id) {
          // console.log('⚠️ No portfolio config found, using fallback data');
          return fallbackDataService.getNiches();
        }

        const { data, error } = await supabase
          .from('niche')
          .select('*')
          .eq('user_id', portfolioConfig.owner_user_id)  // ← NOW filtering by correct user!
          .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        // console.error('Error fetching niches from Supabase, using fallback data:', error);
        // Show fallback notification
        fallbackUtils.showFallbackNotification();
        // Return fallback data when Supabase fails
        return fallbackDataService.getNiches();
      }
    });
  },

  // Get settings for public display
  async getPublicSettings() {
    return await this._withCache('_settingsCache', async () => {
      try {
        console.log('🔍 publicPortfolioService.getPublicSettings: Starting...');
        console.log('  - process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL:', process.env.REACT_APP_PORTFOLIO_OWNER_EMAIL);
        
        // Initialize only once
        await this.initialize();
        
        console.log('🔍 publicPortfolioService.getPublicSettings: Getting portfolio config...');
        
        // Get the user ID for the .env email
        const portfolioConfig = await portfolioConfigService.getPortfolioConfig();
        
        console.log('📋 publicPortfolioService.getPublicSettings: Portfolio config result:', portfolioConfig);
        
        if (!portfolioConfig || !portfolioConfig.owner_user_id) {
          console.log('⚠️ publicPortfolioService.getPublicSettings: No portfolio config found for settings');
          console.log('   - portfolioConfig exists:', !!portfolioConfig);
          console.log('   - owner_user_id exists:', portfolioConfig?.owner_user_id);
          return {};
        }

        console.log('🔍 publicPortfolioService.getPublicSettings: Querying settings table...');
        console.log('   - Using user_id:', portfolioConfig.owner_user_id);
        console.log('   - Portfolio config owner_email:', portfolioConfig.owner_email);

        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', portfolioConfig.owner_user_id);  // ← NOW filtering by correct user!

        console.log('📊 publicPortfolioService.getPublicSettings: Supabase query result:');
        console.log('   - Error:', error);
        console.log('   - Data length:', data?.length || 0);
        console.log('   - Raw data:', data);

        if (error) {
          console.error('❌ publicPortfolioService.getPublicSettings: Supabase error:', error);
          throw error;
        }
        
        // Convert array to object for easier access and parse JSON values
        const settingsObj = {};
        (data || []).forEach(setting => {
          try {
            // Try to parse as JSON to restore original data types
            settingsObj[setting.key] = JSON.parse(setting.value);
          } catch (error) {
            // If parsing fails, use the raw value (for backwards compatibility)
            settingsObj[setting.key] = setting.value;
          }
          console.log(`   - Setting: ${setting.key} = ${settingsObj[setting.key]}`);
        });
        
        console.log('✅ publicPortfolioService.getPublicSettings: Final settings object:', settingsObj);
        console.log('   - banner_name:', settingsObj.banner_name);
        console.log('   - banner_title:', settingsObj.banner_title);
        console.log('   - banner_tagline:', settingsObj.banner_tagline);
        console.log('   - avatar_image:', settingsObj.avatar_image);
        
        return settingsObj;
      } catch (error) {
        console.error('❌ publicPortfolioService.getPublicSettings: Error fetching public settings:', error);
        return {};
      }
    });
  },

  // Legacy method - kept for backward compatibility but now just calls initialize()
  async determineUserId() {
    await this.initialize();
    return this._userIdCache;
  }
};

// ================ CACHE MANAGEMENT ================
// Cache clearing is now handled by the centralized AuthContext
// No need for additional auth state listeners here 

/**
 * Save contact form submission
 */
const saveContactQuery = async (formData) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const queryData = {
      user_id: user.id,
      form_type: 'contact',
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      company: formData.company || null,
      subject: formData.subject,
      message: formData.message,
      budget: formData.budget || null,
      timeline: formData.timeline || null,
      inquiry_type: formData.inquiryType || 'General Inquiry',
      status: 'new',
      priority: 'medium'
    };

    const { data, error } = await supabase
      .from('contact_queries')
      .insert(queryData)
      .select()
      .single();

    if (error) {
      console.error('Error saving contact query:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in saveContactQuery:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save onboarding form submission
 */
const saveOnboardingQuery = async (formData) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const queryData = {
      user_id: user.id,
      form_type: 'onboarding',
      company_name: formData.companyName,
      contact_person: formData.contactPerson,
      communication_channel: formData.communicationChannel,
      business_description: formData.businessDescription,
      target_customer: formData.targetCustomer,
      unique_value: formData.uniqueValue || null,
      problem_solving: formData.problemSolving,
      core_features: formData.coreFeatures,
      existing_system: formData.existingSystem || null,
      technical_constraints: formData.technicalConstraints || null,
      competitors: formData.competitors || null,
      brand_guide: formData.brandGuide || null,
      color_preferences: formData.colorPreferences || null,
      tone_of_voice: formData.toneOfVoice,
      payment_gateways: formData.paymentGateways || null,
      integrations: formData.integrations || null,
      admin_control: formData.adminControl || null,
      gdpr_compliance: formData.gdprCompliance,
      terms_privacy: formData.termsPrivacy,
      launch_date: formData.launchDate || null,
      budget_range: formData.budgetRange,
      post_mvp_features: formData.postMvpFeatures || null,
      long_term_goals: formData.longTermGoals || null,
      status: 'new',
      priority: 'high' // Onboarding queries are typically higher priority
    };

    const { data, error } = await supabase
      .from('contact_queries')
      .insert(queryData)
      .select()
      .single();

    if (error) {
      console.error('Error saving onboarding query:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in saveOnboardingQuery:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all contact queries for the current user
 */
const getContactQueries = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('contact_queries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact queries:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getContactQueries:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update contact query status
 */
const updateQueryStatus = async (queryId, status, notes = null) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.notes = notes;
    }

    if (status === 'completed') {
      updateData.responded_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('contact_queries')
      .update(updateData)
      .eq('id', queryId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating query status:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateQueryStatus:', error);
    return { success: false, error: error.message };
  }
};

export {
  saveContactQuery,
  saveOnboardingQuery,
  getContactQueries,
  updateQueryStatus
}; 