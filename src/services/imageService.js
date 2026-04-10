import { BUCKETS } from '../config/storage';
import { getCurrentUser } from './authUtils';
import { apiService } from './apiService';
import { API_BASE } from '../utils/apiConfig';

// ================ IMAGE OPERATIONS (Vercel Blob via API) ================

export const imageService = {
  // Upload single image
  async uploadImage(file, bucket = BUCKETS.IMAGES) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = apiService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const form = new FormData();
      form.append('file', file);
      form.append('bucket', bucket);

      const res = await fetch(`${API_BASE}/storage/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || res.statusText || 'Upload failed');
      }

      const d = json.data;
      return {
        success: true,
        data: {
          path: d.path,
          url: d.url,
          name: d.name,
          original_name: d.original_name,
          size: d.size,
          type: d.type,
        },
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
      const token = apiService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const q = new URLSearchParams({ path: imagePath, bucket });
      const res = await fetch(`${API_BASE}/storage/delete?${q.toString()}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || res.statusText || 'Delete failed');
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }
  },

  // Get image URL (full URL if already absolute; otherwise return path for callers that resolve later)
  async getImageUrl(imagePath) {
    if (typeof imagePath === 'string' && imagePath.startsWith('http')) {
      return imagePath;
    }
    return imagePath;
  },

  // List images for user
  async listUserImages(bucket = BUCKETS.IMAGES) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = apiService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const res = await fetch(`${API_BASE}/gallery`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || 'Failed to list gallery');
      }

      const imageFiles = (json.data || []).map((file) => ({
        ...file,
        fullPath: file.fullPath,
        url: file.url,
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
      // Upload via API (Vercel Blob)
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