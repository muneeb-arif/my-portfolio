import React, { useState, useEffect } from 'react';
import { imageService } from '../../services/imageService';
import toastService from '../../services/toastService';
import './GallerySection.css';

const GallerySection = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const result = await imageService.listUserImages();
      
      if (result.success) {
        // Filter to only show images (not other file types)
        const imageFiles = result.data.filter(file => 
          file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );
        setImages(imageFiles);
      } else {
        console.error('Failed to load gallery images:', result.error);
        toastService.error('Failed to load gallery images');
      }
    } catch (error) {
      console.error('Error loading gallery images:', error);
      toastService.error('Error loading gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedImages(files);
    setShowUploadModal(true);
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) return;

    try {
      setUploading(true);
      let uploadedCount = 0;

      for (const file of selectedImages) {
        const result = await imageService.uploadImage(file);
        if (result.success) {
          uploadedCount++;
        } else {
          console.error(`Failed to upload ${file.name}:`, result.error);
        }
      }

      if (uploadedCount > 0) {
        toastService.success(`${uploadedCount} image${uploadedCount > 1 ? 's' : ''} uploaded successfully!`);
        await loadImages(); // Reload images
      }

      if (uploadedCount < selectedImages.length) {
        toastService.warning(`${selectedImages.length - uploadedCount} image${selectedImages.length - uploadedCount > 1 ? 's' : ''} failed to upload`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toastService.error('Error uploading images');
    } finally {
      setUploading(false);
      setShowUploadModal(false);
      setSelectedImages([]);
    }
  };

  const handleDeleteImage = async (imagePath) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const result = await imageService.deleteImage(imagePath);
      if (result.success) {
        toastService.success('Image deleted successfully!');
        await loadImages(); // Reload images
      } else {
        toastService.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toastService.error('Error deleting image');
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedImages([]);
  };

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate total storage used
  const calculateTotalSize = () => {
    return images.reduce((total, image) => {
      // Supabase storage list returns size in metadata
      const size = image.metadata?.size || image.size || 0;
      return total + (typeof size === 'number' ? size : 0);
    }, 0);
  };

  // Get storage limit (1 GB for free tier)
  const STORAGE_LIMIT = 1024 * 1024 * 1024; // 1 GB in bytes
  const totalSizeUsed = calculateTotalSize();
  const storagePercentage = (totalSizeUsed / STORAGE_LIMIT) * 100;
  const remainingStorage = STORAGE_LIMIT - totalSizeUsed;

  if (loading) {
    return (
      <div className="gallery-section">
        <div className="section-header">
          <h2>🖼️ Gallery</h2>
          <p>Loading your media collection...</p>
        </div>
        <div className="gallery-grid loading">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="gallery-item skeleton">
              <div className="skeleton-image"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-section">
        <div className="section-header">
          <div className="header-content">
            <h2>🖼️ Gallery</h2>
            <p>Manage your media collection</p>
          </div>
          <div className="header-actions">
            <input
              type="file"
              id="upload-images"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="upload-images" className="btn-primary">
              📤 Upload Images
            </label>
          </div>
        </div>

        {/* Storage Summary */}
        {images.length > 0 && (
          <div className="storage-summary">
            <div className="storage-info">
              <div className="storage-stats">
                <span className="storage-label">📦 Storage Used:</span>
                <span className="storage-value">{formatFileSize(totalSizeUsed)}</span>
                <span className="storage-separator">/</span>
                <span className="storage-total">{formatFileSize(STORAGE_LIMIT)}</span>
              </div>
              <div className="storage-remaining">
                <span className="remaining-label">Remaining:</span>
                <span className="remaining-value">{formatFileSize(remainingStorage)}</span>
              </div>
            </div>
            <div className="storage-progress-container">
              <div className="storage-progress-bar">
                <div 
                  className="storage-progress-fill" 
                  style={{ 
                    width: `${Math.min(storagePercentage, 100)}%`,
                    backgroundColor: storagePercentage > 90 ? '#dc3545' : storagePercentage > 70 ? '#ffc107' : '#28a745'
                  }}
                />
              </div>
              <span className="storage-percentage">{storagePercentage.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {images.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🖼️</div>
            <h3>No Images Yet</h3>
            <p>Upload your first image to get started!</p>
            <label htmlFor="upload-images" className="btn-primary">
              Upload First Image
            </label>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((image, index) => (
              <div key={image.id || index} className="gallery-item">
                <div className="image-container">
                  <img
                    src={image.url}
                    alt={image.name || `Gallery image ${index + 1}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/images/hero-bg.png';
                    }}
                  />
                  <div className="image-overlay">
                    <div className="image-actions">
                      <button
                        className="overlay-btn"
                        onClick={() => window.open(image.url, '_blank')}
                        title="View full size"
                      >
                        👁️
                      </button>
                      <button
                        className="overlay-btn delete"
                        onClick={() => handleDeleteImage(image.fullPath)}
                        title="Delete image"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                <div className="image-info">
                  <p className="image-name">{image.name}</p>
                  <p className="image-size">
                    {formatFileSize(image.metadata?.size || image.size || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Upload Images</h3>
              <button onClick={closeUploadModal} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <p>Uploading {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''}...</p>
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: uploading ? '100%' : '0%' }}
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={closeUploadModal} 
                className="btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload} 
                className="btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GallerySection;
