import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import ImageLightbox from './ImageLightbox';
import './Gallery.css';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      const result = await apiService.getGalleryImages();
      
      if (result.success) {
        // Filter to only show images (not other file types)
        const imageFiles = (result.data || []).filter(file => 
          file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );
        setImages(imageFiles);
      } else {
        console.error('Failed to load gallery images:', result.error);
        setImages([]);
      }
    } catch (error) {
      console.error('Error loading gallery images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image, index) => {
    setSelectedImage({ ...image, index });
    setLightboxOpen(true);
  };

  const handleLightboxClose = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  const handlePreviousImage = () => {
    if (selectedImage && selectedImage.index > 0) {
      const newIndex = selectedImage.index - 1;
      setSelectedImage({ ...images[newIndex], index: newIndex });
    }
  };

  const handleNextImage = () => {
    if (selectedImage && selectedImage.index < images.length - 1) {
      const newIndex = selectedImage.index + 1;
      setSelectedImage({ ...images[newIndex], index: newIndex });
    }
  };

  const handleDownload = async (e, image) => {
    e.stopPropagation(); // Prevent opening lightbox
    
    try {
      // Fetch the image as a blob
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = image.name || `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open in new tab
      window.open(image.url, '_blank');
    }
  };

  if (loading) {
    return (
      <section id="gallery" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
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
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section id="gallery" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="section-header">
            <h2>🖼️ Gallery</h2>
            <p>No images found in your gallery</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="gallery" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="section-header">
            <h2>🖼️ Gallery</h2>
            <p>Explore your media collection</p>
          </div>
          
          <div className="gallery-grid">
            {images.map((image, index) => (
              <div
                key={image.id || index}
                className="gallery-item"
                onClick={() => handleImageClick(image, index)}
              >
                <img
                  src={image.url}
                  alt={image.name || `Gallery image ${index + 1}`}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/images/hero-bg.png';
                  }}
                />
                <div className="gallery-item-overlay">
                  <button
                    className="gallery-download-btn"
                    onClick={(e) => handleDownload(e, image)}
                    title="Download image"
                    aria-label="Download image"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxOpen && selectedImage && (
        <ImageLightbox
          image={selectedImage}
          onClose={handleLightboxClose}
          onPrevious={handlePreviousImage}
          onNext={handleNextImage}
          hasPrevious={selectedImage.index > 0}
          hasNext={selectedImage.index < images.length - 1}
          totalImages={images.length}
          currentIndex={selectedImage.index + 1}
        />
      )}
    </>
  );
};

export default Gallery;
