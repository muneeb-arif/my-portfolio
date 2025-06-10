import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageLightbox = ({ 
  images, 
  currentIndex, 
  isOpen, 
  onClose, 
  onNavigate 
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex] || images[0] || { url: '', caption: 'Image' };

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Handle keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) onNavigate(currentIndex - 1);
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) onNavigate(currentIndex + 1);
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          {/* Image Info */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
            {currentImage?.caption && (
              <span className="text-sm text-gray-300">
                {currentImage.caption}
              </span>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleRotate}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors"
            >
              Reset
            </button>
            
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Image */}
      <div className="absolute inset-0 flex items-center justify-center p-16">
        <img
          src={currentImage?.url}
          alt={currentImage?.caption || 'Portfolio image'}
          className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
            zoomLevel > 1 ? 'cursor-move' : 'cursor-zoom-in'
          }`}
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
          }}
          onMouseDown={handleMouseDown}
          onClick={zoomLevel === 1 ? handleZoomIn : undefined}
          draggable={false}
        />
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {Math.round(zoomLevel * 100)}%
      </div>

      {/* Keyboard Hints */}
      <div className="absolute bottom-4 right-4 text-white/70 text-xs space-y-1">
        <div>ESC: Close</div>
        <div>↑↓: Navigate</div>
        <div>+/-: Zoom</div>
        <div>R: Rotate</div>
      </div>
    </div>
  );
};

export default ImageLightbox; 