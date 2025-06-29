import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Track scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', toggleVisibility);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed z-50 p-3 rounded-full bg-sand-dark hover:bg-gray-700 text-white 
        shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-sand-dark focus:ring-offset-2
        
        /* Mobile: above sticky bottom nav (24 = 6rem above mobile nav) */
        bottom-24 right-4 sm:right-6
        
        /* Desktop: normal bottom right positioning */
        lg:bottom-6 lg:right-6
        
        /* Subtle bounce animation */
        animate-bounce
      `}
      aria-label="Scroll to top"
      title="Back to top"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
};

export default ScrollToTop; 