import React, { useState, useEffect } from 'react';
import { imageService } from '../../services/imageService';
import { useAuth } from '../../services/authContext';
import toastService from '../../services/toastService';
import './GallerySection.css';

const GallerySection = () => {
  const { user } = useAuth();
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
                  <p className="image-size">{(image.metadata?.size / 1024 / 1024).toFixed(2)} MB</p>
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
