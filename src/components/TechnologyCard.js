import React, { useState, useRef, useEffect } from 'react';

const TechnologyCard = ({ icon: Icon, title, technologies, backgroundImage, animationDelay }) => {
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <div
      ref={cardRef}
      className={`
        relative group overflow-hidden rounded-xl 
        transform transition-all duration-500 hover:scale-103
        hover:shadow-2xl cursor-pointer min-h-[280px]
        ${isVisible ? 'fade-in-up' : 'opacity-0 translate-y-8'}
      `}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Background Image - More Subtle */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105 opacity-60"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'blur(1px) brightness(0.7)'
        }}
      />
      
      {/* Primary Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Uniform Gray Overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgb(55 65 81 / var(--tw-bg-opacity, 1))' }} />
      
      {/* Additional Heavy Blur Layer */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-lg" />
      
      {/* Extra Blur for Stronger Glassmorphism */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/5" />
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-white/25 backdrop-blur-xl rounded-lg flex items-center justify-center group-hover:bg-white/35 transition-all duration-300 border border-white/30 shadow-lg">
            <Icon className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white text-center mb-6 drop-shadow-lg group-hover:text-white transition-colors duration-300">
          {title}
        </h3>

        {/* Technologies List */}
        <div className="space-y-3 flex-1">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="text-sm text-white/95 text-center py-2 px-3 bg-white/20 backdrop-blur-xl rounded-lg group-hover:bg-white/30 border border-white/20 transition-all duration-300 drop-shadow-md shadow-lg"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>

      {/* Hover Glow Effect - More Subtle */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/3 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Border Glow - Stronger */}
      <div className="absolute inset-0 rounded-xl border border-white/30 group-hover:border-white/50 transition-colors duration-300" />
    </div>
  );
};

export default TechnologyCard; 