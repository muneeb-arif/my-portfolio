import React from 'react';

const SkeletonLoader = ({ type = 'project', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index} className="animate-pulse">
      {type === 'project' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image skeleton */}
          <div className="w-full h-48 bg-gray-300"></div>
          <div className="p-4">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            {/* Description skeleton */}
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
            {/* Button skeleton */}
            <div className="h-10 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      )}

      {type === 'hero' && (
        <div className="text-center py-20">
          {/* Name skeleton */}
          <div className="h-12 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
          {/* Title skeleton */}
          <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-6"></div>
          {/* Description skeleton */}
          <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      )}

      {type === 'technology' && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {/* Icon skeleton */}
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          {/* Title skeleton */}
          <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-3"></div>
          {/* Skills skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-4/5"></div>
            <div className="h-4 bg-gray-300 rounded w-3/5"></div>
          </div>
        </div>
      )}

      case 'settings':
        return (
          <div className="settings-skeleton">
            {[...Array(3)].map((_, groupIndex) => (
              <div key={groupIndex} className="settings-group-skeleton">
                <div className="skeleton-title h-6 w-32 mb-4"></div>
                {[...Array(2)].map((_, fieldIndex) => (
                  <div key={fieldIndex} className="field-skeleton mb-4">
                    <div className="skeleton-label h-4 w-20 mb-2"></div>
                    <div className="skeleton-input h-10 w-full"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
    </div>
  ));

  return <>{skeletons}</>;
};

export default SkeletonLoader; 