import React, { useState, useEffect } from 'react';
import ClientOnboardingForm from './ClientOnboardingForm';
import ContactForm from './ContactForm';
import { FileText, Mail, Phone } from 'lucide-react';
import { useSettings } from '../services/settingsContext';
import { usePublicData } from '../services/PublicDataContext';
import { menuService } from '../services/menuService';

const Header = ({ additionalDataLoading }) => {
  const { getSetting, loading: settingsLoading, initialized: settingsInitialized } = useSettings();
  const { projects, technologies, niches, loading: publicLoading } = usePublicData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [headerMenus, setHeaderMenus] = useState([]);
  const [menusLoading, setMenusLoading] = useState(true);
  
  // Load dynamic menus for header
  useEffect(() => {
    const loadHeaderMenus = async () => {
      try {
        setMenusLoading(true);
        const result = await menuService.getMenusByLocation('header');
        if (result.success && result.data && result.data.length > 0) {
          setHeaderMenus(result.data);
        } else {
          setHeaderMenus([]);
        }
      } catch (error) {
        console.error('Error loading header menus:', error);
        setHeaderMenus([]);
      } finally {
        setMenusLoading(false);
      }
    };
    loadHeaderMenus();
  }, []);

  // Track which sections have data
  const sectionsData = {
    hasProjects: projects && projects.length > 0,
    hasTechnologies: technologies && technologies.length > 0,
    hasDomains: niches && niches.length > 0,
    loading: publicLoading
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
  };



  const handleCall = () => {
    const phoneNumber = getSetting('phone_number');
    if (phoneNumber) {
      // Remove any non-digit characters except + for tel: links
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  const scrollToSection = (sectionId) => {
    // Try to find the element
    let element = document.getElementById(sectionId);
    
    // If not found immediately, wait a bit for dynamic content to load
    if (!element) {
      setTimeout(() => {
        element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.warn(`Section with id "${sectionId}" not found`);
        }
      }, 100);
    } else {
      element.scrollIntoView({ behavior: 'smooth' });
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
          console.log('🔗 Menu click - Section:', menu.section_id, '-> Target:', targetSection);
          scrollToSection(targetSection);
        }
        break;
      case 'contact':
        openContactForm();
        break;
      case 'start_project':
        openForm();
        break;
      case 'call':
        handleCall();
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

  // Don't render navigation until we know what sections have data
  const showNavigation = !settingsLoading && settingsInitialized && !sectionsData.loading;
  
  // Get section visibility settings
  const sectionVisibility = {
    portfolio: getSetting('section_portfolio_visible') !== undefined ? getSetting('section_portfolio_visible') : false,
    technologies: getSetting('section_technologies_visible') !== undefined ? getSetting('section_technologies_visible') : false,
    domains: getSetting('section_domains_visible') !== undefined ? getSetting('section_domains_visible') : false,
    projectCycle: getSetting('section_project_cycle_visible') !== undefined ? getSetting('section_project_cycle_visible') : false
  };

  // Debug: Log settings values to understand the issue
  console.log('🔍 Header Debug - Section Visibility Settings:', {
    portfolio: {
      raw: getSetting('section_portfolio_visible'),
      processed: sectionVisibility.portfolio,
      type: typeof getSetting('section_portfolio_visible')
    },
    technologies: {
      raw: getSetting('section_technologies_visible'),
      processed: sectionVisibility.technologies,
      type: typeof getSetting('section_technologies_visible')
    },
    domains: {
      raw: getSetting('section_domains_visible'),
      processed: sectionVisibility.domains,
      type: typeof getSetting('section_domains_visible')
    },
    projectCycle: {
      raw: getSetting('section_project_cycle_visible'),
      processed: sectionVisibility.projectCycle,
      type: typeof getSetting('section_project_cycle_visible')
    }
  });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="relative w-12 h-8 flex items-center justify-center">
                {getSetting('logo_type') === 'image' && getSetting('logo_image') ? (
                  // Show logo image
                  <img 
                    src={getSetting('logo_image')} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  // Show initials (default)
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Main logo background */}
                    <div className="absolute inset-0 bg-white/10 rounded-sm"></div>
                    
                    {/* MA Initials */}
                    <span className="relative text-white font-bold text-2xl tracking-wider">
                      {getSetting('logo_initials') || 'MA'}
                    </span>
                    
                    {/* Decorative dots */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  </div>
                )}
                
                {/* Fallback initials (hidden by default, shown if image fails) */}
                {getSetting('logo_type') === 'image' && getSetting('logo_image') && (
                  <div className="relative w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                    <div className="absolute inset-0 bg-white/10 rounded-sm"></div>
                    <span className="relative text-white font-bold text-2xl tracking-wider">
                      {getSetting('logo_initials') || 'MA'}
                    </span>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {!menusLoading && headerMenus.length > 0 ? (
                // Render dynamic menus
                headerMenus.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => handleMenuClick(menu)}
                    className="text-white hover:text-white/80 transition-colors"
                    title={menu.label || (menu.icon ? 'Menu item' : '')}
                  >
                    {menu.icon && <span className={menu.label ? "mr-1" : ""}>{menu.icon}</span>}
                    {menu.label}
                  </button>
                ))
              ) : (
                // Fallback to default navigation
                <>
                  <a href="#hero" className="text-white hover:text-white/80 transition-colors">
                    Home
                  </a>
                  
                  {showNavigation && sectionsData.hasProjects && sectionVisibility.portfolio && (
                    <button 
                      onClick={() => scrollToSection('portfolio')}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      Portfolio
                    </button>
                  )}
                  
                  {showNavigation && sectionsData.hasTechnologies && sectionVisibility.technologies && (
                    <button 
                      onClick={() => scrollToSection('technologies')}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      Technologies
                    </button>
                  )}
                  
                  {showNavigation && sectionsData.hasDomains && sectionVisibility.domains && (
                    <button 
                      onClick={() => scrollToSection('domains')}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      Domains
                    </button>
                  )}
                  
                  {showNavigation && sectionVisibility.projectCycle && (
                    <button 
                      onClick={() => scrollToSection('process')}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      Process
                    </button>
                  )}
                </>
              )}
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              {!menusLoading && headerMenus.length > 0 ? (
                // Render dynamic menu buttons (filter action items)
                headerMenus
                  .filter(menu => ['contact', 'start_project', 'call', 'social_facebook', 'social_linkedin', 'social_github', 'social_instagram'].includes(menu.menu_type))
                  .map((menu) => {
                    const getIcon = () => {
                      switch (menu.menu_type) {
                        case 'start_project': return <FileText size={16} />;
                        case 'contact': return <Mail size={16} />;
                        case 'call': return <Phone size={16} />;
                        default: return null;
                      }
                    };
                    
                    return (
                      <button
                        key={menu.id}
                        onClick={() => handleMenuClick(menu)}
                        className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                      >
                        {getIcon()}
                        <span className="hidden sm:inline">{menu.label}</span>
                      </button>
                    );
                  })
              ) : (
                // Fallback to default buttons
                <>
                  {getSetting('start_project_visible') !== false && (
                    <button
                      onClick={openForm}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                    >
                      <FileText size={16} />
                      <span className="hidden sm:inline">Start Project</span>
                    </button>
                  )}
                  
                  {getSetting('header_contact_visible') !== false && (
                    <button
                      onClick={openContactForm}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                    >
                      <Mail size={16} />
                      <span className="hidden sm:inline">Contact</span>
                    </button>
                  )}
                  
                  {/* Call Button - Only show on mobile when phone number is set */}
                  {getSetting('phone_number') && (
                    <button
                      onClick={handleCall}
                      className="md:hidden bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
                      title={`Call ${getSetting('phone_number')}`}
                    >
                      <Phone size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Client Onboarding Form */}
      <ClientOnboardingForm isOpen={isFormOpen} onClose={closeForm} />

      {/* Contact Form */}
      <ContactForm isOpen={isContactFormOpen} onClose={closeContactForm} />
    </>
  );
};

export default Header; 