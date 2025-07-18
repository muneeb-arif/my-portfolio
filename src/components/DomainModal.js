import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import ContactForm from './ContactForm';
import { useSettings } from '../services/settingsContext';

const DomainModal = ({ domain, onClose, onNavigate, canNavigateLeft, canNavigateRight }) => {
  const { getSetting } = useSettings();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    if (domain) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Push a new state to history when modal opens
      window.history.pushState({ modalOpen: 'domain-modal' }, '', window.location.href);
      
      // Listen for back button press
      const handlePopState = () => {
        // Simply close the modal when back button is pressed
        onClose();
      };
      
      window.addEventListener('popstate', handlePopState);
      
      // Handle keyboard navigation
      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          onClose();
        } else if (event.key === 'ArrowLeft' && canNavigateLeft) {
          onNavigate('prev');
        } else if (event.key === 'ArrowRight' && canNavigateRight) {
          onNavigate('next');
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('popstate', handlePopState);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [domain, onClose, onNavigate, canNavigateLeft, canNavigateRight]);

  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
  };



  // Prepare pre-filled data for contact form
  const getPrefillData = () => {
    if (!domain) return {};
    
    // Get dynamic name from settings
    const bannerName = getSetting('banner_name') || 'Muneeb Arif';
    const firstName = bannerName.split(' ')[0];
    
    return {
      inquiryType: 'General Inquiry',
      subject: `Quote Request - ${domain.title}`,
      message: `Hi ${firstName},

I'm interested in getting a quote for ${domain.title} development services.

Domain/Niche: ${domain.title}
${domain.subtitle ? `Overview: ${domain.subtitle}` : ''}
${domain.tags && domain.tags.length > 0 ? `Technologies: ${domain.tags.join(', ')}` : ''}

Please provide a detailed quote including:
• Project scope and deliverables
• Timeline estimates
• Pricing breakdown
• Next steps

Looking forward to hearing from you!`
    };
  };

  // Handle image fallback with hierarchy: local → unsplash → default
  const handleImageError = (e) => {
    const currentSrc = e.target.src;
    
    // If it's a local image that failed, try Unsplash
    if (currentSrc.includes('/images/domains/') && !currentSrc.includes('default.jpeg')) {
      const imageName = currentSrc.split('/').pop().replace('.jpeg', '').replace('.jpg', '').replace('.png', '');
      const unsplashQuery = imageName.replace('-', ' ');
      e.target.src = `https://source.unsplash.com/800x600/?${unsplashQuery}`;
    }
    // If Unsplash fails, fall back to default
    else if (currentSrc.includes('source.unsplash.com')) {
      e.target.src = '/images/hero-bg.png';
    }
    // If default also fails, hide the image section
    else {
      e.target.parentElement.style.display = 'none';
    }
  };

  if (!domain) return null;

  const { title, subtitle, badge, modalContent, icon: Icon, image, tags, ai_driven } = domain;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Touch handlers for swipe navigation
  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRightSwipe && canNavigateLeft) {
      onNavigate('prev');
    } else if (isLeftSwipe && canNavigateRight) {
      onNavigate('next');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-custom bg-black/50"
      onClick={handleBackdropClick}
    >
      {/* Desktop Domain Navigation Arrows - Outside Modal */}
      {canNavigateLeft && (
        <button
          onClick={() => onNavigate('prev')}
          className="hidden lg:flex absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 xl:w-14 xl:h-14 bg-white hover:bg-gray-50 rounded-full shadow-2xl items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-100"
          aria-label="Previous domain"
        >
          <ChevronLeft className="w-6 h-6 xl:w-7 xl:h-7 text-gray-600 hover:text-sand-dark transition-colors duration-300" />
        </button>
      )}

      {canNavigateRight && (
        <button
          onClick={() => onNavigate('next')}
          className="hidden lg:flex absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 xl:w-14 xl:h-14 bg-white hover:bg-gray-50 rounded-full shadow-2xl items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-100"
          aria-label="Next domain"
        >
          <ChevronRight className="w-6 h-6 xl:w-7 xl:h-7 text-gray-600 hover:text-sand-dark transition-colors duration-300" />
        </button>
      )}

      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
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
                {ai_driven && (
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    🤖 AI-Driven
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Navigation indicators */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              {canNavigateLeft && (
                <span className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </span>
              )}
              {canNavigateLeft && canNavigateRight && <span>•</span>}
              {canNavigateRight && (
                <span className="flex items-center gap-1">
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
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
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Mobile Domain Navigation Arrows - Top Corners (Mobile Only) */}
              {canNavigateLeft && (
                <button
                  onClick={() => onNavigate('prev')}
                  className="lg:hidden absolute left-4 top-4 z-20 w-12 h-12 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-gray-200"
                  aria-label="Previous domain"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-sand-dark transition-colors duration-300" />
                </button>
              )}

              {canNavigateRight && (
                <button
                  onClick={() => onNavigate('next')}
                  className="lg:hidden absolute right-4 top-4 z-20 w-12 h-12 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group border border-gray-200"
                  aria-label="Next domain"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-sand-dark transition-colors duration-300" />
                </button>
              )}

              {/* Mobile Navigation Hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden">
                <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                  Swipe left/right to navigate
                </div>
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
              onClick={openContactForm}
            >
              Get Quote
            </button>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactForm isOpen={isContactFormOpen} onClose={closeContactForm} prefillData={getPrefillData()} />
    </div>
  );
};

export default DomainModal; 