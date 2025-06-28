import React from 'react';

const LoadingOverlay = ({ isLoading, children, type = 'fade' }) => {
  if (type === 'fade') {
    return (
      <div className="relative">
        {/* Content */}
        <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
          {children}
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm transition-all duration-500">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your portfolio...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'blur') {
    return (
      <div className={`transition-all duration-700 ${isLoading ? 'filter blur-sm scale-95' : 'filter blur-0 scale-100'}`}>
        {children}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-700">Loading...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return children;
};

export default LoadingOverlay; 