import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

// Utility function to render text with line breaks
const renderTextWithLineBreaks = (text) => {
  if (!text) return null;
  
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

const Modal = ({ project, onClose, onNavigate, canNavigateLeft, canNavigateRight }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Reset current image index when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [project]);

  // Check if project has multiple images
  const hasMultipleImages = project.details.images && project.details.images.length > 1;
  const images = project.details.images || [{ url: project.image, caption: 'Project Preview' }];
  const currentImage = images[currentImageIndex] || { url: project.image, caption: 'Project Preview' };

  // Image navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Lightbox functions
  const openLightbox = (imageIndex = currentImageIndex) => {
    setLightboxImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const navigateLightbox = (newIndex) => {
    setLightboxImageIndex(newIndex);
  };

  // Detect image aspect ratio for smart layout
  const getImageAspectClass = (image) => {
    // This would ideally be determined by actual image dimensions
    // For now, we'll use a more flexible height approach
    return 'min-h-64 max-h-[70vh]';
  };

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Handle keyboard navigation
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && canNavigateLeft) {
        onNavigate('prev');
      } else if (event.key === 'ArrowRight' && canNavigateRight) {
        onNavigate('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNavigate, canNavigateLeft, canNavigateRight]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Touch handlers for swipe navigation
  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRightSwipe && canNavigateLeft) {
      onNavigate('prev');
    } else if (isLeftSwipe && canNavigateRight) {
      onNavigate('next');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-custom bg-black/50"
      onClick={handleBackdropClick}
    >
      {/* Desktop Project Navigation Arrows - Outside Modal */}
      {canNavigateLeft && (
        <button
          onClick={() => onNavigate('prev')}
          className="hidden lg:flex absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 xl:w-14 xl:h-14 bg-white hover:bg-gray-50 rounded-full shadow-2xl items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-100"
          aria-label="Previous project"
        >
          <ChevronLeft className="w-6 h-6 xl:w-7 xl:h-7 text-gray-600 hover:text-sand-dark transition-colors duration-300" />
        </button>
      )}

      {canNavigateRight && (
        <button
          onClick={() => onNavigate('next')}
          className="hidden lg:flex absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 xl:w-14 xl:h-14 bg-white hover:bg-gray-50 rounded-full shadow-2xl items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-100"
          aria-label="Next project"
        >
          <ChevronRight className="w-6 h-6 xl:w-7 xl:h-7 text-gray-600 hover:text-sand-dark transition-colors duration-300" />
        </button>
      )}

      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header - Sticky Top */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">{project.title}</h2>
          <div className="flex items-center gap-4">
            {/* Navigation indicators */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              {canNavigateLeft && (
                <span className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </span>
              )}
              {canNavigateLeft && canNavigateRight && <span>•</span>}
              {canNavigateRight && (
                <span className="flex items-center gap-1">
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Project Image Gallery */}
          <div className="relative">
            {/* Main Image - Smart Aspect Ratio */}
            <div className={`relative ${getImageAspectClass(currentImage)} flex items-center justify-center bg-gray-100`}>
              <img
                src={currentImage?.url || project.image}
                alt={currentImage?.caption || project.title}
                className="w-full h-full object-contain transition-opacity duration-300 cursor-zoom-in"
                onClick={() => openLightbox(currentImageIndex)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              
              {/* Expand/Zoom Button */}
              <button
                onClick={() => openLightbox(currentImageIndex)}
                className="absolute top-4 right-4 lg:top-6 lg:right-6 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 text-white"
                aria-label="View full size"
              >
                <Expand className="w-5 h-5" />
              </button>
              
              {/* Mobile Project Navigation Arrows - Top Corners (Mobile Only) */}
              {canNavigateLeft && (
                <button
                  onClick={() => onNavigate('prev')}
                  className="lg:hidden absolute left-4 top-4 z-20 w-12 h-12 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-gray-200"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-sand-dark transition-colors duration-300" />
                </button>
              )}

              {canNavigateRight && (
                <button
                  onClick={() => onNavigate('next')}
                  className="lg:hidden absolute right-4 top-4 z-20 w-12 h-12 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-gray-200"
                  aria-label="Next project"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-sand-dark transition-colors duration-300" />
                </button>
              )}
              
              {/* Image Navigation Arrows - Bottom Corners (only if multiple images) */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 bottom-4 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 bottom-4 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="px-4 py-2 bg-white/90 text-sand-dark font-semibold rounded-full text-sm backdrop-blur-sm">
                  {project.category}
                </span>
              </div>

              {/* Image Counter (only if multiple images) */}
              {hasMultipleImages && (
                <div className="absolute top-4 left-4 lg:left-auto lg:right-4 z-10">
                  <span className="px-3 py-1 bg-black/60 text-white rounded-full text-sm backdrop-blur-sm">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                </div>
              )}

              {/* Image Caption */}
              {(currentImage?.caption || project.title) && (
                <div className={`absolute bottom-4 z-10 ${hasMultipleImages ? 'left-16 right-16' : 'left-4 right-4'}`}>
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm text-center">
                    {currentImage?.caption || `${project.title} - Preview`}
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Strip (only if multiple images) */}
            {hasMultipleImages && (
              <div className="bg-gray-50 p-4">
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <button
                        onClick={() => goToImage(index)}
                        onDoubleClick={() => openLightbox(index)}
                        className={`
                          flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300
                          ${index === currentImageIndex 
                            ? 'border-sand-dark shadow-lg scale-105' 
                            : 'border-gray-200 hover:border-sand-light hover:scale-102'
                          }
                        `}
                      >
                                              <img
                        src={image?.url || project.image}
                        alt={image?.caption || `Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      </button>
                      
                      {/* Thumbnail expand icon on hover */}
                      <button
                        onClick={() => openLightbox(index)}
                        className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Expand className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="p-6 space-y-8">
            {/* Overview */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Project Overview</h3>
              <p className="text-gray-600 leading-relaxed">
                {renderTextWithLineBreaks(project.details.overview)}
              </p>
            </div>

            {/* Technologies */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.details.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-sand-light text-sand-dark rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Key Features</h3>
              <ul className="space-y-2">
                {project.details.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-sand-dark rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons - Sticky Bottom */}
        <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Only show Live Demo button if URL is valid */}
            {(project.details.liveUrl && project.details.liveUrl !== '#' && project.details.liveUrl !== '') && (
              <a
                href={project.details.liveUrl}
                className="flex-1 px-6 py-3 bg-sand-dark text-white font-semibold rounded-full text-center hover:bg-gray-700 transform hover:scale-105 transition-all duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Live Demo
              </a>
            )}
            {/* Only show Source Code button if URL is valid */}
            {(project.details.githubUrl && project.details.githubUrl !== '#' && project.details.githubUrl !== '') && (
              <a
                href={project.details.githubUrl}
                className="flex-1 px-6 py-3 border-2 border-sand-dark text-sand-dark font-semibold rounded-full text-center hover:bg-sand-dark hover:text-white transform hover:scale-105 transition-all duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Source Code
              </a>
            )}
            {/* Show message if no buttons are available */}
            {(!project.details.liveUrl || project.details.liveUrl === '#' || project.details.liveUrl === '') && 
             (!project.details.githubUrl || project.details.githubUrl === '#' || project.details.githubUrl === '') && (
              <div className="flex-1 px-6 py-3 text-center text-gray-500 italic">
                Demo and source code links coming soon
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={images}
        currentIndex={lightboxImageIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNavigate={navigateLightbox}
      />
    </div>
  );
};

export default Modal; 