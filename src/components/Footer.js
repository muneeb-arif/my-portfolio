import React, { useState, useEffect } from 'react';
import ClientOnboardingForm from './ClientOnboardingForm';
import { FileText, Mail, Github, Instagram, Phone, MapPin } from 'lucide-react';
import { useSettings } from '../services/settingsContext';
import { menuService } from '../services/menuService';

const Footer = () => {
  const { getSetting } = useSettings();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [footerMenus, setFooterMenus] = useState([]);
  const [menusLoading, setMenusLoading] = useState(true);

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  // Email click handler
  const handleEmailClick = () => {
    const mailtoLink = `mailto:${getSetting('social_email')}?subject=${encodeURIComponent('Get Started - TheExpertWays.com')}`;
    window.location.href = mailtoLink;
  };

  // Phone click handler
  const handlePhoneClick = () => {
    const phoneNumber = getSetting('phone_number');
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  // Map location click handler
  const handleMapClick = () => {
    const mapUrl = getSetting('map_location_url');
    if (mapUrl) {
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Load dynamic menus for footer
  useEffect(() => {
    const loadFooterMenus = async () => {
      try {
        setMenusLoading(true);
        const result = await menuService.getMenusByLocation('footer');
        if (result.success && result.data && result.data.length > 0) {
          setFooterMenus(result.data);
        } else {
          setFooterMenus([]);
        }
      } catch (error) {
        console.error('Error loading footer menus:', error);
        setFooterMenus([]);
      } finally {
        setMenusLoading(false);
      }
    };
    loadFooterMenus();
  }, []);

  // Smooth scroll to section function
  const scrollToSection = (sectionId) => {
    // Try to find the element
    let element = document.getElementById(sectionId);
    
    // If not found immediately, wait a bit for dynamic content to load
    if (!element) {
      setTimeout(() => {
        element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        } else {
          console.warn(`Section with id "${sectionId}" not found`);
        }
      }, 100);
    } else {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Handle menu item click based on menu type
  const handleMenuClick = (menu) => {
    switch (menu.menu_type) {
      case 'section':
        if (menu.section_id) {
          // Map hardcoded section IDs to actual section IDs on the page
          // If not in map, assume it's a dynamic section UUID and use it directly
          const sectionMap = {
            'hero': 'hero',
            'portfolio': 'portfolio',
            'technologies': 'technologies',
            'domains': 'domains',
            'projectCycle': 'process',
            'prompts': 'prompts',
            'gallery': 'gallery',
            'footer': 'footer'
          };
          // Check if it's a known hardcoded section, otherwise use the section_id directly (for dynamic sections)
          const targetSection = sectionMap[menu.section_id] || menu.section_id;
          scrollToSection(targetSection);
        }
        break;
      case 'contact':
        handleEmailClick();
        break;
      case 'start_project':
        openForm();
        break;
      case 'call':
        handlePhoneClick();
        break;
      case 'social_facebook':
      case 'social_linkedin':
      case 'social_github':
      case 'social_instagram':
        if (menu.link_url) {
          window.open(menu.link_url, '_blank', 'noopener,noreferrer');
        }
        break;
      default:
        break;
    }
  };

  // Get visibility settings
  const footerVisible = getSetting('footer_visible') !== undefined ? getSetting('footer_visible') : true;
  const footerAboutVisible = getSetting('footer_about_visible') !== undefined ? getSetting('footer_about_visible') : true;
  const footerQuickLinksVisible = getSetting('footer_quick_links_visible') !== undefined ? getSetting('footer_quick_links_visible') : true;
  const footerServicesVisible = getSetting('footer_services_visible') !== undefined ? getSetting('footer_services_visible') : true;
  const footerContactInfoVisible = getSetting('footer_contact_info_visible') !== undefined ? getSetting('footer_contact_info_visible') : true;
  const startProjectVisible = getSetting('start_project_visible') !== undefined ? getSetting('start_project_visible') : true;

  // Don't render footer if it's hidden
  if (!footerVisible) {
    return (
      <>
        {/* Client Onboarding Form Modal - still available even if footer is hidden */}
        <ClientOnboardingForm isOpen={isFormOpen} onClose={closeForm} />
      </>
    );
  }

  // Calculate visible sections for grid layout
  const visibleSections = [
    footerAboutVisible,
    footerQuickLinksVisible,
    footerServicesVisible,
    footerContactInfoVisible
  ].filter(Boolean).length;

  // Determine grid columns based on visible sections
  const gridCols = visibleSections === 0 ? 'md:grid-cols-1' : 
                   visibleSections === 1 ? 'md:grid-cols-3' :
                   visibleSections === 2 ? 'md:grid-cols-4' :
                   visibleSections === 3 ? 'md:grid-cols-5' : 'md:grid-cols-5';

  return (
    <>
      <footer className="pt-12 pb-24 lg:pb-12 relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
        {/* Background Pattern - Behind content */}
        <div className="absolute inset-0 opacity-5 z-0 pointer-events-none">
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                 radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                 backgroundSize: '50px 50px'
               }}>
          </div>
        </div>

        {/* Main Content - Above background */}
        <div className="container mx-auto px-4 relative z-10">
          <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
            
            {/* Brand Section */}
            {footerAboutVisible && (
              <div className={visibleSections > 0 ? "md:col-span-2" : "md:col-span-1"}>
              <h3 className="text-2xl font-bold text-white mb-4">About</h3>
              {getSetting('footer_about_text') && (
                <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-md">
                  {getSetting('footer_about_text')}
                </p>
              )}
              <div className="flex space-x-4">
                <button 
                  onClick={handleEmailClick}
                  className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                  title="Contact Me"
                >
                  <Mail className="w-5 h-5" />
                </button>
                {getSetting('social_github') && (
                  <a 
                    href={getSetting('social_github')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer inline-block p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                    title="GitHub Profile"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {getSetting('social_instagram') && (
                  <a 
                    href={getSetting('social_instagram')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer inline-block p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                    title="Instagram Profile"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {getSetting('social_facebook') && (
                  <a 
                    href={getSetting('social_facebook')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer inline-block p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                    title="Facebook Profile"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
            )}

            {/* Quick Links */}
            {footerQuickLinksVisible && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              {!menusLoading && footerMenus.length > 0 ? (
                // Render dynamic menus (filter section type menus for Quick Links)
                <ul className="space-y-2">
                  {footerMenus
                    .filter(menu => menu.menu_type === 'section')
                    .map((menu) => (
                      <li key={menu.id}>
                        <button 
                          onClick={() => handleMenuClick(menu)}
                          className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                        >
                          {menu.icon && <span className="mr-1">{menu.icon}</span>}
                          {menu.label}
                          <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                        </button>
                      </li>
                    ))}
                </ul>
              ) : (
                // Fallback to default Quick Links
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => scrollToSection('portfolio')}
                      className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                    >
                      About
                      <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-16"></span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('technologies')}
                      className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                    >
                      Technologies
                      <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-20"></span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('domains')}
                      className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                    >
                      Domains
                      <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-16"></span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('process')}
                      className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                    >
                      Process
                      <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-14"></span>
                    </button>
                  </li>
                </ul>
              )}
            </div>
            )}

            {/* Services */}
            {footerServicesVisible && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => scrollToSection('domains')}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                  >
                    Web Development
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-28"></span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('domains')}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                  >
                    E-commerce Solutions
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-32"></span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('domains')}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                  >
                    API Development
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-26"></span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={openForm}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 flex items-center gap-2 group cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative"
                  >
                    <FileText className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Client Onboarding Form
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-36"></span>
                  </button>
                </li>
              </ul>
            </div>
            )}

            {/* Contact Information */}
            {footerContactInfoVisible && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact Info</h4>
              <div className="space-y-3">
                {getSetting('phone_number') && (
                  <div className="flex items-start space-x-2">
                    <Phone className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
                    <button
                      onClick={handlePhoneClick}
                      className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-0 hover:underline"
                    >
                      {getSetting('phone_number')}
                    </button>
                  </div>
                )}
                
                {getSetting('social_email') && (
                  <div className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
                    <button
                      onClick={handleEmailClick}
                      className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-0 hover:underline"
                    >
                      {getSetting('social_email')}
                    </button>
                  </div>
                )}
                
                {getSetting('address') && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
                    <div className="text-white/70 text-sm">
                      {getSetting('address')}
                    </div>
                  </div>
                )}
                
                {getSetting('map_location_url') && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
                    <button
                      onClick={handleMapClick}
                      className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-0 hover:underline"
                    >
                      View on Map
                    </button>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 text-sm mb-4 md:mb-0">
              {getSetting('copyright_text')}
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <button 
                onClick={() => {
      // console.log('Privacy button clicked');
                  alert('Privacy Policy: This portfolio website collects no personal data. All form submissions are for demonstration purposes only.');
                }}
                className="text-white/60 hover:text-white text-sm transition-all duration-300 cursor-pointer bg-transparent border-none px-3 py-2 rounded-lg hover:bg-white/5 hover:scale-105 transform hover:shadow-lg"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => {
      // console.log('Terms button clicked');
                  alert('Terms of Service: This portfolio is for demonstration purposes. For actual project terms, please contact directly.');
                }}
                className="text-white/60 hover:text-white text-sm transition-all duration-300 cursor-pointer bg-transparent border-none px-3 py-2 rounded-lg hover:bg-white/5 hover:scale-105 transform hover:shadow-lg"
              >
                Terms of Service
              </button>
              {!menusLoading && footerMenus.length > 0 ? (
                // Render dynamic menu buttons (filter action items)
                footerMenus
                  .filter(menu => ['start_project', 'contact', 'call', 'social_facebook', 'social_linkedin', 'social_github', 'social_instagram'].includes(menu.menu_type))
                  .map((menu) => (
                    <button
                      key={menu.id}
                      onClick={() => handleMenuClick(menu)}
                      className="text-white/60 hover:text-white text-sm transition-all duration-300 cursor-pointer bg-transparent border-none px-4 py-2 rounded-lg hover:bg-white/10 hover:scale-105 transform hover:shadow-lg border border-transparent hover:border-white/20"
                    >
                      {menu.icon && <span className="mr-1">{menu.icon}</span>}
                      {menu.label}
                    </button>
                  ))
              ) : (
                // Fallback to default Start Project button
                startProjectVisible && (
                  <button 
                    onClick={openForm}
                    className="text-white/60 hover:text-white text-sm transition-all duration-300 cursor-pointer bg-transparent border-none px-4 py-2 rounded-lg hover:bg-white/10 hover:scale-105 transform hover:shadow-lg border border-transparent hover:border-white/20"
                  >
                    Start Project
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Client Onboarding Form Modal */}
      <ClientOnboardingForm isOpen={isFormOpen} onClose={closeForm} />
    </>
  );
};

export default Footer; 