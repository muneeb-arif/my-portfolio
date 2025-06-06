import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const Modal = ({ project, onClose, onNavigate, canNavigateLeft, canNavigateRight }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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
      {/* Navigation Arrows - Outside the modal */}
      {canNavigateLeft && (
        <button
          onClick={() => onNavigate('prev')}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/95 hover:bg-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-gray-200"
          aria-label="Previous project"
        >
          <ChevronLeft className="w-7 h-7 text-gray-700 group-hover:text-sand-dark transition-colors duration-300" />
        </button>
      )}

      {canNavigateRight && (
        <button
          onClick={() => onNavigate('next')}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/95 hover:bg-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-gray-200"
          aria-label="Next project"
        >
          <ChevronRight className="w-7 h-7 text-gray-700 group-hover:text-sand-dark transition-colors duration-300" />
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
          {/* Project Image */}
          <div className="relative h-64 md:h-80 lg:h-96">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-4 py-2 bg-white/90 text-sand-dark font-semibold rounded-full text-sm backdrop-blur-sm">
                {project.category}
              </span>
            </div>

            {/* Mobile Navigation Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden">
              <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                Swipe left/right to navigate
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="p-6 space-y-8">
            {/* Overview */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Project Overview</h3>
              <p className="text-gray-600 leading-relaxed">
                {project.details.overview}
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
            <a
              href={project.details.liveUrl}
              className="flex-1 px-6 py-3 bg-sand-dark text-white font-semibold rounded-full text-center hover:bg-gray-700 transform hover:scale-105 transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Live Demo
            </a>
            <a
              href={project.details.githubUrl}
              className="flex-1 px-6 py-3 border-2 border-sand-dark text-sand-dark font-semibold rounded-full text-center hover:bg-sand-dark hover:text-white transform hover:scale-105 transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 