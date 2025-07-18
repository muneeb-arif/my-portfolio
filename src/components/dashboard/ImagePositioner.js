import React, { useState, useRef, useEffect } from 'react';
import './ImagePositioner.css';

const ImagePositioner = ({ 
  imageUrl, 
  tempImageUrl, // New prop for temporary file preview
  containerWidth = 300, 
  containerHeight = 200, 
  imageWidth = 400, 
  imageHeight = 300,
  positionX = 50, 
  positionY = 50, 
  zoom = 100,
  onPositionChange,
  title = "Image Positioner",
  isCircular = false,
  previewMode = "realistic" // New prop: "simple" or "realistic"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({ x: positionX, y: positionY });
  const [lastInputMethod, setLastInputMethod] = useState('initial'); // 'drag' or 'input'
  const containerRef = useRef(null);

  // Update position when props change
  useEffect(() => {
    setCurrentPosition({ x: positionX, y: positionY });
  }, [positionX, positionY]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    // Calculate percentage position
    const newX = Math.max(0, Math.min(100, currentPosition.x + (deltaX / containerWidth) * 100));
    const newY = Math.max(0, Math.min(100, currentPosition.y + (deltaY / containerHeight) * 100));
    
    setCurrentPosition({ x: newX, y: newY });
    setDragStart({ x: currentX, y: currentY });
    
    if (onPositionChange) {
      onPositionChange(newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile devices
  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    // Calculate percentage position
    const newX = Math.max(0, Math.min(100, currentPosition.x + (deltaX / containerWidth) * 100));
    const newY = Math.max(0, Math.min(100, currentPosition.y + (deltaY / containerHeight) * 100));
    
    setCurrentPosition({ x: newX, y: newY });
    setDragStart({ x: currentX, y: currentY });
    
    if (onPositionChange) {
      onPositionChange(newX, newY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handlePresetClick = (x, y) => {
    setCurrentPosition({ x, y });
    if (onPositionChange) onPositionChange(x, y);
    setLastInputMethod('preset');
  };

  // Calculate image position and size
  const imageSize = Math.max(imageWidth, imageHeight) * (zoom / 100);
  const imageLeft = (currentPosition.x / 100) * (containerWidth - imageSize);
  const imageTop = (currentPosition.y / 100) * (containerHeight - imageSize);

  // Use tempImageUrl if available, otherwise fall back to imageUrl
  const displayImageUrl = tempImageUrl || imageUrl;

  // Render realistic banner preview
  const renderRealisticBannerPreview = () => (
    <div 
      ref={containerRef}
      className="realistic-banner-preview"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div 
        className="banner-background"
        style={{
          backgroundImage: `url('${displayImageUrl}')`,
          backgroundSize: `${zoom}%`,
          backgroundPosition: `${currentPosition.x}% ${currentPosition.y}%`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="banner-overlay" />
      
      {/* Content Placeholder */}
      <div className="banner-content-placeholder">
        <div className="content-box">
          <div className="name-placeholder">Your Name</div>
          <div className="title-placeholder">Your Title</div>
          <div className="tagline-placeholder">Your tagline here</div>
        </div>
      </div>
      
      {/* Avatar Placeholder */}
      <div className="avatar-placeholder">
        <div className="avatar-circle" />
      </div>
    </div>
  );

  // Render realistic avatar preview
  const renderRealisticAvatarPreview = () => (
    <div className="realistic-avatar-preview">
      <div 
        ref={containerRef}
        className="avatar-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="avatar-image"
          style={{
            backgroundImage: `url('${displayImageUrl}')`,
            backgroundSize: `${zoom}%`,
            backgroundPosition: `${currentPosition.x}% ${currentPosition.y}%`,
          }}
        />
        <div className="avatar-border" />
        <div className="avatar-ripple" />
      </div>
    </div>
  );

  // Render simple preview (original behavior)
  const renderSimplePreview = () => (
    <div 
      ref={containerRef}
      className={`positioner-container ${isCircular ? 'circular' : ''}`}
      style={{ 
        width: containerWidth, 
        height: containerHeight,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="positioner-image"
        style={{
          width: imageSize,
          height: imageSize,
          left: imageLeft,
          top: imageTop,
          backgroundImage: `url('${displayImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: isCircular ? '50%' : '0',
          transform: `scale(${zoom / 100})`
        }}
      />
      
      {/* Grid overlay for reference */}
      <div className="positioner-grid">
        <div className="grid-line horizontal" style={{ top: '25%' }}></div>
        <div className="grid-line horizontal" style={{ top: '50%' }}></div>
        <div className="grid-line horizontal" style={{ top: '75%' }}></div>
        <div className="grid-line vertical" style={{ left: '25%' }}></div>
        <div className="grid-line vertical" style={{ left: '50%' }}></div>
        <div className="grid-line vertical" style={{ left: '75%' }}></div>
      </div>
      
      {/* Corner indicators */}
      <div className="corner-indicator top-left"></div>
      <div className="corner-indicator top-right"></div>
      <div className="corner-indicator bottom-left"></div>
      <div className="corner-indicator bottom-right"></div>
    </div>
  );

  return (
    <div className="image-positioner">
      <h4 className="positioner-title">
        {title}
        {tempImageUrl && <span className="preview-badge">🆕 Preview</span>}
      </h4>
      <div className="positioner-instructions">
        <p>Drag the image to position it within the container, or enter exact values below</p>
        <div className="position-inputs">
          <div className="position-input-group">
            <label htmlFor={`position-x-${title.replace(/\s+/g, '-').toLowerCase()}`}>X Position:</label>
            <input
              id={`position-x-${title.replace(/\s+/g, '-').toLowerCase()}`}
              type="number"
              min="0"
              max="100"
              value={Math.round(currentPosition.x)}
              onChange={(e) => {
                const newX = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                setCurrentPosition(prev => ({ ...prev, x: newX }));
                if (onPositionChange) {
                  onPositionChange(newX, currentPosition.y);
                }
                setLastInputMethod('input');
              }}
              className="position-input"
            />
            <span className="position-unit">%</span>
          </div>
          <div className="position-input-group">
            <label htmlFor={`position-y-${title.replace(/\s+/g, '-').toLowerCase()}`}>Y Position:</label>
            <input
              id={`position-y-${title.replace(/\s+/g, '-').toLowerCase()}`}
              type="number"
              min="0"
              max="100"
              value={Math.round(currentPosition.y)}
              onChange={(e) => {
                const newY = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                setCurrentPosition(prev => ({ ...prev, y: newY }));
                if (onPositionChange) {
                  onPositionChange(currentPosition.x, newY);
                }
                setLastInputMethod('input');
              }}
              className="position-input"
            />
            <span className="position-unit">%</span>
          </div>
        </div>
        
        {/* Preset Positions */}
        <div className="preset-positions">
          <span className="preset-label">Quick presets:</span>
          <div className="preset-buttons">
            <button 
              type="button"
              className="preset-btn"
              onClick={() => handlePresetClick(50, 50)}
              title="Center"
            >
              Center
            </button>
            <button 
              type="button"
              className="preset-btn"
              onClick={() => handlePresetClick(0, 0)}
              title="Top Left"
            >
              Top Left
            </button>
            <button 
              type="button"
              className="preset-btn"
              onClick={() => handlePresetClick(100, 0)}
              title="Top Right"
            >
              Top Right
            </button>
            <button 
              type="button"
              className="preset-btn"
              onClick={() => handlePresetClick(0, 100)}
              title="Bottom Left"
            >
              Bottom Left
            </button>
            <button 
              type="button"
              className="preset-btn"
              onClick={() => handlePresetClick(100, 100)}
              title="Bottom Right"
            >
              Bottom Right
            </button>
          </div>
        </div>
      </div>
      
      {/* Preview Container */}
      <div className="preview-container">
        {previewMode === "realistic" ? (
          isCircular ? renderRealisticAvatarPreview() : renderRealisticBannerPreview()
        ) : (
          renderSimplePreview()
        )}
      </div>
    </div>
  );
};

export default ImagePositioner; 