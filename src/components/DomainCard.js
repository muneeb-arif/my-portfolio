import React from 'react';

const DomainCard = ({ domain, onClick, isSelected }) => {
  const { title, subtitle, tags, badge, image, icon: Icon, ai_driven } = domain;

  return (
    <div
      onClick={() => onClick(domain)}
      className={`
        relative bg-white rounded-2xl shadow-lg hover:shadow-xl
        transition-all duration-300 transform hover:scale-102
        cursor-pointer overflow-hidden group min-h-[280px]
        ${isSelected ? 'ring-4 ring-sand-dark shadow-2xl scale-102' : ''}
      `}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {badge}
          </span>
        </div>
      )}

      {/* AI-Driven Badge */}
      {ai_driven && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            🤖 AI-Driven
          </span>
        </div>
      )}

      {/* Image/Icon Section */}
      <div className="relative h-32 bg-gradient-to-br from-sand-light to-sand overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : Icon ? (
          <div className="flex items-center justify-center h-full">
            <Icon className="w-16 h-16 text-sand-dark" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 bg-sand-dark rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">{title.charAt(0)}</span>
            </div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-sand-dark transition-colors duration-300">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {subtitle}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-sand-light text-sand-dark text-xs font-medium px-3 py-1 rounded-full border border-sand transition-colors duration-300 group-hover:bg-sand group-hover:text-white"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-sand-dark/20 rounded-2xl transition-all duration-300" />
    </div>
  );
};

export default DomainCard; 