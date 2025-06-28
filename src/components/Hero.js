import React, { useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import ClientOnboardingForm from './ClientOnboardingForm';
import { useSettings } from '../services/settingsContext';
import SkeletonLoader from './SkeletonLoader';
import portfolioService from '../services/portfolioService';

const Hero = ({ isLoading = false }) => {
  const { getSetting } = useSettings();
  const [settings, setSettings] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await portfolioService.getPublicSettings();
        setSettings(settingsData);
      } catch (error) {
      // console.error('Error loading hero settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };

    if (!isLoading) {
      loadSettings();
    }
  }, [isLoading]);

  const isContentLoading = isLoading || settingsLoading;

  const scrollToPortfolio = () => {
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResumeDownload = () => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = getSetting('resume_file');
    link.download = 'Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isContentLoading) {
    return (
      <section className="hero-section relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <SkeletonLoader type="hero" count={1} />
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${getSetting('hero_banner_image')}')`,
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
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            {/* iOS-styled backdrop blur container - compact around content only */}
            <div className="inline-block backdrop-blur-md bg-white/10 rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 border border-white/20 shadow-2xl max-w-full w-full sm:w-auto">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight drop-shadow-lg">
                  {settings.banner_name || 'Developer'}
                </h1>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white/90 drop-shadow-lg">
                  {settings.banner_title || 'Full Stack Developer'}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-lg leading-relaxed drop-shadow-lg">
                  {settings.banner_tagline || 'Creating amazing digital experiences with modern technologies'}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-6">
                <button
                  onClick={scrollToPortfolio}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 whitespace-nowrap text-sm sm:text-base"
                >
                  View My Work
                </button>
                <button
                  onClick={handleResumeDownload}
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/20 hover:border-white/60 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 justify-center shadow-lg hover:shadow-xl whitespace-nowrap text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Resume
                </button>
              </div>
            </div>
          </div>

          {/* Right Content - Profile Image with Ripple Effects */}
          <div className="flex-shrink-0">
            <div className="relative">
              {/* Profile Image Container */}
              <div 
                className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-8 border-white shadow-2xl relative z-10"
                style={{
                  backgroundImage: `url('${getSetting('avatar_image')}')`,
                  backgroundSize: '100%',
                  backgroundPosition: 'center top',
                  backgroundRepeat: 'no-repeat'
                }}
                role="img"
                aria-label={`${settings.bannerName || 'Developer'} - ${settings.bannerTitle || 'Full Stack Developer'}`}
              ></div>

              {/* Ripple Effects */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Main Ripple */}
                <div className="ripple w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"></div>
                
                {/* Large Ripple */}
                <div className="ripple-large w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"></div>
                
                {/* Small Ripple */}
                <div className="ripple-small w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"></div>
                
                {/* Pulse Ripple */}
                <div className="ripple-pulse w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"></div>
              </div>

              {/* Decorative Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-sand-dark opacity-20 scale-110 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center backdrop-blur-sm bg-white/10">
          <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 