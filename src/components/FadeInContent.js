import React, { useState, useEffect } from 'react';

const FadeInContent = ({ 
  children, 
  isLoading, 
  delay = 0, 
  className = "",
  staggerChildren = false,
  staggerDelay = 100 
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [isLoading, delay]);

  if (staggerChildren && Array.isArray(children)) {
    return (
      <div className={className}>
        {children.map((child, index) => (
          <div
            key={index}
            className={`transition-all duration-500 transform ${
              shouldShow && !isLoading
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{
              transitionDelay: shouldShow ? `${index * staggerDelay}ms` : '0ms'
            }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-700 transform ${
        shouldShow && !isLoading
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-95'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default FadeInContent; 