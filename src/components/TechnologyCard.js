import React from 'react';

const TechnologyCard = ({ icon: Icon, title, technologies, backgroundImage, animationDelay }) => {
  return (
    <div
      className="relative group overflow-hidden rounded-xl transform transition-all duration-300 hover:scale-103 hover:shadow-2xl cursor-pointer min-h-[280px] opacity-100"
    >
      {/* Background Image - Optimized */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105 opacity-40"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'brightness(0.7)'
        }}
      />
      
      {/* Single Uniform Overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgb(55 65 81 / 0.9)' }} />
      
              {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 border border-white/20">
              <Icon className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white text-center mb-6 group-hover:text-white transition-colors duration-300">
            {title}
          </h3>

          {/* Technologies List */}
          <div className="space-y-3 flex-1">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="text-sm text-white/95 text-center py-2 px-3 bg-white/15 rounded-lg group-hover:bg-white/25 border border-white/10 transition-all duration-300"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Simple Border */}
        <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40 transition-colors duration-300" />
    </div>
  );
};

export default TechnologyCard; 