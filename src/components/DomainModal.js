import React, { useEffect } from 'react';

const DomainModal = ({ domain, onClose }) => {
  useEffect(() => {
    if (domain) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle Escape key
      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [domain, onClose]);

  if (!domain) return null;

  const { title, subtitle, badge, modalContent, icon: Icon, image, tags } = domain;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-custom bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col">
        {/* Header - Sticky Top */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sand-light rounded-xl flex items-center justify-center shadow-md">
              {Icon && <Icon className="w-6 h-6 text-sand-dark" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                {badge && (
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Domain Image */}
          {image && (
            <div className="relative h-64 md:h-80 lg:h-96">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Tags in top right */}
              <div className="absolute top-4 right-4 flex gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/90 text-sand-dark font-semibold rounded-full text-sm backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Domain Details */}
          <div className="p-6 space-y-8">
            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Domain Overview</h3>
              <p className="text-gray-600 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Technologies/Tags */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Technologies & Tools</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-sand-light text-sand-dark rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Key Features & Capabilities</h3>
              <ul className="space-y-2">
                {modalContent.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-sand-dark rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons - Sticky Bottom */}
        <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-sand-dark text-white font-semibold rounded-full text-center hover:bg-gray-700 transform hover:scale-105 transition-all duration-300"
            >
              Close Details
            </button>
            <button
              className="flex-1 px-6 py-3 border-2 border-sand-dark text-sand-dark font-semibold rounded-full text-center hover:bg-sand-dark hover:text-white transform hover:scale-105 transition-all duration-300"
              onClick={() => {
                // Could add functionality to contact about this domain
                console.log(`Interested in ${title} development`);
              }}
            >
              Get Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainModal; 