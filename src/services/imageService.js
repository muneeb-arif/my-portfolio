import { supabase, BUCKETS } from '../config/supabase';
import { getCurrentUser } from './authUtils';
import { apiService } from './apiService';

// ================ IMAGE OPERATIONS ================

export const imageService = {
  // Upload single image
  async uploadImage(file, bucket = BUCKETS.IMAGES) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Sanitize filename
      const sanitizeFilename = (filename) => {
        const lastDotIndex = filename.lastIndexOf('.');
        const name = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
        const extension = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
        
        const sanitizedName = name
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_+|_+$/g, '')
          .substring(0, 100);
        
        return sanitizedName + extension;
      };

      // Generate unique filename with user folder
      const timestamp = Date.now();
      const sanitizedFilename = sanitizeFilename(file.name);
      const fileName = `${user.id}/${timestamp}_${sanitizedFilename}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        success: true,
        data: {
          path: fileName,
          url: urlData.publicUrl,
          name: sanitizedFilename,
          original_name: file.name,
          size: file.size,
          type: file.type
        }
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload multiple images
  async uploadImages(files, bucket = BUCKETS.IMAGES) {
    const results = [];
    for (const file of files) {
      const result = await this.uploadImage(file, bucket);
      results.push(result);
    }
    return results;
  },

  // Delete image
  async deleteImage(imagePath, bucket = BUCKETS.IMAGES) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([imagePath]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }
  },

  // Get image URL
  getImageUrl(imagePath, bucket = BUCKETS.IMAGES) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(imagePath);
    return data.publicUrl;
  },

  // List images for user
  async listUserImages(bucket = BUCKETS.IMAGES) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(user.id, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const imageFiles = (data || [])
        .filter(file => 
          file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) && 
          !file.name.startsWith('.')
        )
        .map(file => ({
          ...file,
          fullPath: `${user.id}/${file.name}`,
          url: this.getImageUrl(`${user.id}/${file.name}`, bucket)
        }));

      return { success: true, data: imageFiles };
    } catch (error) {
      console.error('Error listing user images:', error);
      return { success: false, error: error.message };
    }
  },

  // Save image metadata to database (for project images) - Now uses local API
  async saveImageMetadata(projectId, imageData) {
    try {
      console.log('📤 imageService.saveImageMetadata called:', {
        projectId,
        imageName: imageData.name,
        order_index: imageData.order_index
      });

      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use local API instead of Supabase
      const response = await apiService.makeRequest(`/projects/${projectId}/images`, {
        method: 'POST',
        body: JSON.stringify({
          url: imageData.url,
          path: imageData.path,
          name: imageData.name,
          original_name: imageData.original_name,
          size: imageData.size,
          type: imageData.type,
          bucket: BUCKETS.IMAGES,
          order_index: imageData.order_index
        })
      });

      if (response.success) {
        console.log('✅ imageService.saveImageMetadata success:', {
          imageName: imageData.name,
          order_index: response.data?.order_index
        });
        return { success: true, data: response.data };
      } else {
        console.error('❌ imageService.saveImageMetadata failed:', response.error);
        throw new Error(response.error || 'Failed to save image metadata');
      }
    } catch (error) {
      console.error('Error saving image metadata:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload project image (combines upload + metadata save)
  async uploadProjectImage(projectId, file) {
    try {
      // Upload the image to Supabase
      const uploadResult = await this.uploadImage(file);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Save metadata to local API
      const metadataResult = await this.saveImageMetadata(projectId, uploadResult.data);
      if (!metadataResult.success) {
        // Try to delete the uploaded image if metadata save fails
        await this.deleteImage(uploadResult.data.path);
        throw new Error(metadataResult.error);
      }

      return { success: true, data: metadataResult.data };
    } catch (error) {
      console.error('Error uploading project image:', error);
      return { success: false, error: error.message };
    }
  },

  // Get project images from local API
  async getProjectImages(projectId) {
    try {
      console.log('📥 imageService.getProjectImages called for project:', projectId);
      
      const response = await apiService.makeRequest(`/projects/${projectId}/images`);
      
      if (response.success) {
        console.log('📊 imageService.getProjectImages success:', {
          projectId,
          imageCount: response.data?.length || 0,
          images: response.data?.map(img => ({
            name: img.name,
            order_index: img.order_index
          })) || []
        });
        return { success: true, data: response.data || [] };
      } else {
        console.error('❌ imageService.getProjectImages failed:', response.error);
        throw new Error(response.error || 'Failed to get project images');
      }
    } catch (error) {
      console.error('Error getting project images:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete all project images from local API
  async deleteProjectImages(projectId) {
    try {
      console.log('🗑️ imageService.deleteProjectImages called for project:', projectId);
      
      const response = await apiService.makeRequest(`/projects/${projectId}/images`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        console.log('✅ imageService.deleteProjectImages success for project:', projectId);
        return { success: true };
      } else {
        console.error('❌ imageService.deleteProjectImages failed:', response.error);
        throw new Error(response.error || 'Failed to delete project images');
      }
    } catch (error) {
      console.error('Error deleting project images:', error);
      return { success: false, error: error.message };
    }
  }
}; 