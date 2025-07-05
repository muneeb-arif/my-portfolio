import React from 'react';

const DomainCard = ({ domain, onClick, isSelected }) => {
  const { title, subtitle, tags, badge, image, icon: Icon, ai_driven } = domain;

  // Handle image fallback with hierarchy: local → unsplash → default
  const handleImageError = (e) => {
    const currentSrc = e.target.src;
    
    // If it's a local image that failed, try Unsplash
    if (currentSrc.includes('/images/domains/') && !currentSrc.includes('default.jpeg')) {
      const imageName = currentSrc.split('/').pop().replace('.jpeg', '').replace('.jpg', '').replace('.png', '');
      const unsplashQuery = imageName.replace('-', ' ');
      e.target.src = `https://source.unsplash.com/400x300/?${unsplashQuery}`;
    }
    // If Unsplash fails, fall back to default
    else if (currentSrc.includes('source.unsplash.com')) {
      e.target.src = '/images/domains/default.jpeg';
    }
    // If default also fails, show icon fallback (handled below)
    else {
      e.target.style.display = 'none';
      e.target.nextElementSibling.style.display = 'flex';
    }
  };

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
          <>
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
            {/* Icon fallback (hidden by default, shown if image fails) */}
            <div className="hidden items-center justify-center h-full w-full absolute inset-0 bg-gradient-to-br from-sand-light to-sand">
              {Icon ? (
                <Icon className="w-16 h-16 text-sand-dark" />
              ) : (
                <div className="w-16 h-16 bg-sand-dark rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{title.charAt(0)}</span>
                </div>
              )}
            </div>
          </>
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
          {tags && tags.length > 0 ? tags.map((tag, index) => (
            <span
              key={index}
              className="bg-sand-light text-sand-dark text-xs font-medium px-3 py-1 rounded-full border border-sand transition-colors duration-300 group-hover:bg-sand group-hover:text-white"
            >
              {tag}
            </span>
          )) : (
            <span className="bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1 rounded-full border border-gray-200">
              No tags available
            </span>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-sand-dark/20 rounded-2xl transition-all duration-300" />
    </div>
  );
};

export default DomainCard; 