import React, { useState, useRef, useEffect } from 'react';

const Card = ({ project, onClick, animationDelay }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setMousePosition({ x: x * 0.1, y: y * 0.1 });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`
        group cursor-pointer transform transition-all duration-500 magnetic
        ${isVisible ? 'slide-in-up' : 'opacity-0'}
      `}
      style={{ 
        animationDelay: `${animationDelay}s`,
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) ${isHovering ? 'scale(1.05)' : 'scale(1)'}`
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
          {/* Loading Placeholder */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          )}
          
          {/* Project Image */}
          <img
            src={project.image}
            alt={project.title}
            className={`
              w-full h-full object-cover transition-all duration-700 group-hover:scale-110
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-sand-dark transition-colors duration-300">
              {project.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Category Tag */}
          <div className="flex items-center justify-between">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-sand-dark bg-sand-light rounded-full">
              {project.category}
            </span>
            
            {/* CTA Button */}
            <button className="magnetic px-4 py-2 text-sm font-semibold text-sand-dark border border-sand-dark rounded-full hover:bg-sand-dark hover:text-white transition-all duration-300 group-hover:scale-105">
              {project.buttonText}
            </button>
          </div>
        </div>

        {/* Magnetic Glow Effect */}
        {isHovering && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(201, 167, 125, 0.3) 0%, transparent 70%)`,
              transition: 'background 0.1s ease-out'
            }}
          />
        )}

        {/* Shine Effect */}
        <div className="absolute inset-0 -top-full group-hover:top-0 bg-gradient-to-b from-transparent via-white/10 to-transparent transform transition-all duration-1000 pointer-events-none" />
      </div>
    </div>
  );
};

export default Card; 