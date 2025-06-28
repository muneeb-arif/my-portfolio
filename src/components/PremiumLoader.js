import React from 'react';
import SkeletonLoader from './SkeletonLoader';
import FadeInContent from './FadeInContent';

const PremiumLoader = ({ 
  isLoading, 
  children, 
  skeletonType = 'project',
  skeletonCount = 3,
  className = ""
}) => {
  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <SkeletonLoader type={skeletonType} count={skeletonCount} />
      </div>
    );
  }

  // Smooth content reveal
  return (
    <FadeInContent isLoading={false} className={className}>
      {children}
    </FadeInContent>
  );
};

export default PremiumLoader; 