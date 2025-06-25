import { supabase, TABLES, BUCKETS } from '../config/supabase';

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
      console.error('Error fetching projects:', error);
      throw error;
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
  // Get user settings
  async getSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.SETTINGS)
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Convert array to object
      const settings = {};
      data?.forEach(setting => {
        settings[setting.key] = setting.value;
      });
      
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  // Update setting
  async updateSetting(key, value) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from(TABLES.SETTINGS)
        .upsert({
          user_id: user.id,
          key: key,
          value: value
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
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
      console.error('Error fetching categories:', error);
      throw error;
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