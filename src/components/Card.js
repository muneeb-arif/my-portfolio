import React, { useState } from 'react';

const Card = ({ project, onClick, animationDelay }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105 opacity-100"
      onClick={onClick}
    >
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative h-56 md:h-64 lg:h-72 xl:h-80 overflow-hidden">
          {/* Loading Placeholder */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          )}
          
          {/* Project Image */}
          <img
            src={project.image}
            alt={project.title}
            className={`
              w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-110
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
            <button className="px-4 py-2 text-sm font-semibold text-sand-dark border border-sand-dark rounded-full hover:bg-sand-dark hover:text-white transition-all duration-300 group-hover:scale-105">
              {project.buttonText}
            </button>
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 -top-full group-hover:top-0 bg-gradient-to-b from-transparent via-white/10 to-transparent transform transition-all duration-1000 pointer-events-none" />
      </div>
    </div>
  );
};

export default Card; 