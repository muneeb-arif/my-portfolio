import React, { useMemo, useEffect } from 'react';
import { useSettings } from '../services/settingsContext';
import SkeletonLoader from './SkeletonLoader';

const Hero = ({ isLoading = false }) => {
  const { settings, loading } = useSettings();
  const [isDesktop, setIsDesktop] = React.useState(false);

  // Check if we're on desktop (lg breakpoint and above)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Create stable avatar URL with fixed cache buster to prevent infinite re-renders (must be before early returns)
  const avatarUrl = useMemo(() => {
    const avatarImage = settings?.avatar_image || '/images/profile/avatar.jpeg';
    
    if (!avatarImage) return '/images/profile/avatar.jpeg';
    
    // For database URLs, use a stable cache buster based on the URL itself
    if (avatarImage.startsWith('http')) {
      // Use a hash of the URL or just add a simple version parameter
      return `${avatarImage}?v=${Date.now()}`;
    }
    
    // For local images, use as-is
    return avatarImage;
  }, [settings?.avatar_image]);

  // Wait for settings to load completely
  if (loading || isLoading || !settings || Object.keys(settings).length === 0) {
    return (
      <section className="hero-section relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <SkeletonLoader type="hero" count={1} />
        </div>
      </section>
    );
  }

  // Get values directly from settings with fallbacks
  const avatarImage = settings.avatar_image || '/images/profile/avatar.jpeg';
  const heroBannerImage = settings.hero_banner_image || '/images/hero-bg.png';
  const bannerName = settings.banner_name || 'Developer';
  const bannerTitle = settings.banner_title || 'Full Stack Developer';
  const bannerTagline = settings.banner_tagline || 'Creating amazing digital experiences with modern technologies';
  const resumeFile = settings.resume_file;
  // Fix: Properly handle the boolean setting - default to true only if undefined, otherwise respect the actual value
  const showResumeDownload = settings.show_resume_download === undefined ? true : settings.show_resume_download;
  const showViewWorkButton = settings.show_view_work_button === undefined ? true : settings.show_view_work_button;
  const customButtonTitle = settings.custom_button_title || '';
  const customButtonLink = settings.custom_button_link || '';
  const customButtonTarget = settings.custom_button_target || '_self';

  const scrollToPortfolio = () => {
    const element = document.getElementById('portfolio');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToNextSection = () => {
    // Try to find the next visible section after hero
    const sections = [
      'portfolio',
      'technologies', 
      'domains',
      'project-cycle',
      'prompts'
    ];
    
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element && element.offsetParent !== null) { // Check if element is visible
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        return;
      }
    }
    
    // Fallback to portfolio if no other sections are visible
    scrollToPortfolio();
  };

  // Handle keyboard navigation for the scroll button
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToNextSection();
    }
  };

  const downloadResume = () => {
    if (resumeFile) {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = resumeFile;
      link.download = `${bannerName.replace(/\s+/g, '-')}-Resume.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCustomButtonClick = () => {
    if (customButtonLink) {
      if (customButtonLink.startsWith('#')) {
        // Handle anchor links (same page)
        const element = document.querySelector(customButtonLink);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      } else {
        // Handle external links
        window.open(customButtonLink, customButtonTarget);
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Mobile: cover center, Desktop: custom positioning */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${heroBannerImage}')`,
          ...(isDesktop ? {
            backgroundSize: `${settings.hero_banner_zoom || 100}%`,
            backgroundPosition: `${settings.hero_banner_position_x || 50}% ${settings.hero_banner_position_y || 50}%`,
          } : {
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          })
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-desert-sand/80 via-wet-sand/70 to-sand-dark/60" />

      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Desert Mountains Silhouette */}
        <div className="absolute bottom-0 left-0 w-full h-2/3">
          <svg 
            viewBox="0 0 1200 600" 
            className="absolute bottom-0 w-full h-full opacity-20"
            preserveAspectRatio="xMidYMid slice"
          >
            <path 
              d="M0,600 L0,400 Q200,300 400,350 Q600,400 800,320 Q1000,240 1200,300 L1200,600 Z" 
              fill="rgba(139, 69, 19, 0.3)"
            />
            <path 
              d="M0,600 L0,450 Q300,350 600,400 Q900,450 1200,380 L1200,600 Z" 
              fill="rgba(160, 82, 45, 0.2)"
            />
          </svg>
        </div>

        {/* Fort Silhouette */}
        <div className="absolute bottom-1/4 right-1/4 opacity-30">
          <svg width="120" height="80" viewBox="0 0 120 80">
            <rect x="10" y="40" width="100" height="40" fill="rgba(101, 67, 33, 0.5)" />
            <rect x="0" y="30" width="20" height="50" fill="rgba(101, 67, 33, 0.5)" />
            <rect x="100" y="30" width="20" height="50" fill="rgba(101, 67, 33, 0.5)" />
            <rect x="30" y="20" width="15" height="60" fill="rgba(101, 67, 33, 0.5)" />
            <rect x="75" y="15" width="15" height="65" fill="rgba(101, 67, 33, 0.5)" />
          </svg>
        </div>

        {/* Hitchhiker Silhouette */}
        <div className="absolute bottom-1/3 left-1/3 opacity-40 animate-float">
          <svg width="40" height="60" viewBox="0 0 40 60">
            <circle cx="20" cy="10" r="6" fill="rgba(101, 67, 33, 0.7)" />
            <rect x="17" y="16" width="6" height="25" fill="rgba(101, 67, 33, 0.7)" />
            <rect x="10" y="20" width="8" height="3" fill="rgba(101, 67, 33, 0.7)" />
            <rect x="15" y="41" width="4" height="15" fill="rgba(101, 67, 33, 0.7)" />
            <rect x="21" y="41" width="4" height="15" fill="rgba(101, 67, 33, 0.7)" />
            <ellipse cx="8" cy="25" rx="6" ry="10" fill="rgba(101, 67, 33, 0.5)" />
          </svg>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-sand-dark animate-float"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 6 + 's',
                animationDuration: (Math.random() * 3 + 4) + 's'
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-6 lg:space-y-8 order-2 lg:order-1">
            {/* iOS-styled backdrop blur container - compact around content only */}
            <div className="inline-block backdrop-blur-md bg-white/10 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 border border-white/20 shadow-2xl max-w-full w-full sm:w-auto">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight drop-shadow-lg">
                  {bannerName}
                </h1>
                <h2 className="text-left lg:text-left text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-white/90 drop-shadow-lg">
                  {bannerTitle}
                </h2>
                <p className="text-left lg:text-left text-sm sm:text-base md:text-lg lg:text-xl text-white/80 max-w-lg leading-relaxed drop-shadow-lg">
                  {bannerTagline}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-4 sm:pt-6">
                {showViewWorkButton && (
                  <button
                    onClick={scrollToPortfolio}
                    className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white/20 backdrop-blur-sm text-gray-800 font-semibold rounded-full hover:bg-white/30 hover:text-gray-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 whitespace-nowrap text-sm sm:text-base"
                  >
                    View My Work
                  </button>
                )}
                {resumeFile && showResumeDownload && (
                  <button
                    onClick={downloadResume}
                    className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white/90 backdrop-blur-sm text-sand-dark font-semibold rounded-full hover:bg-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/50 whitespace-nowrap text-sm sm:text-base"
                  >
                    Download Resume
                  </button>
                )}
                {customButtonTitle && customButtonLink && (
                  <button
                    onClick={handleCustomButtonClick}
                    className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white/20 backdrop-blur-sm text-gray-800 font-semibold rounded-full hover:bg-white/30 hover:text-gray-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 whitespace-nowrap text-sm sm:text-base"
                  >
                    {customButtonTitle}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Profile Image with Ripple Effects */}
          <div className="flex-shrink-0 order-1 lg:order-2">
            <div className="relative">
              {/* Profile Image Container */}
              <div 
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden border-4 sm:border-6 lg:border-8 border-white shadow-2xl relative z-10"
                style={{
                  backgroundImage: `url('${avatarUrl}')`,
                  ...(isDesktop ? {
                    backgroundSize: `${settings.avatar_zoom || 100}%`,
                    backgroundPosition: `${settings.avatar_position_x || 50}% ${settings.avatar_position_y || 50}%`,
                  } : {
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }),
                  backgroundRepeat: 'no-repeat'
                }}
                role="img"
                aria-label={`${bannerName} - ${bannerTitle}`}
              ></div>

              {/* Ripple Effects */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Main Ripple */}
                <div className="ripple w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96"></div>
                
                {/* Large Ripple */}
                <div className="ripple-large w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96"></div>
                
                {/* Small Ripple */}
                <div className="ripple-small w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96"></div>
                
                {/* Pulse Ripple */}
                <div className="ripple-pulse w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96"></div>
              </div>

              {/* Decorative Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-sand-dark opacity-20 scale-110 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Clickable */}
      <button
        onClick={scrollToNextSection}
        onKeyDown={handleKeyDown}
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer group focus:outline-none focus:ring-4 focus:ring-white/30 rounded-full p-1 sm:p-2 transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
        aria-label="Scroll to next section"
        title="Click to scroll to next section"
        tabIndex={0}
      >
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center backdrop-blur-sm bg-white/10 group-hover:bg-white/20 group-hover:border-white/80 transition-all duration-300">
          <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse group-hover:bg-white"></div>
        </div>
      </button>
    </section>
  );
};

export default Hero; 