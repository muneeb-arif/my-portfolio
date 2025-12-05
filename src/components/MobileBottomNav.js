import React, { useState, useEffect } from 'react';
import { Briefcase, Code, Globe, CheckCircle, Mail, Phone, Image, Home, FileText, Facebook, Linkedin, Github, Instagram } from 'lucide-react';
import ContactForm from './ContactForm';
import ClientOnboardingForm from './ClientOnboardingForm';
import { useSettings } from '../services/settingsContext';
import { usePublicData } from '../services/PublicDataContext';
import { menuService } from '../services/menuService';

const MobileBottomNav = ({ additionalDataLoading }) => {
  const { getSetting, loading: settingsLoading, initialized: settingsInitialized } = useSettings();
  const { projects, technologies, niches, loading: publicLoading } = usePublicData();
  const [activeSection, setActiveSection] = useState('hero');
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [mobileMenus, setMobileMenus] = useState([]);
  const [menusLoading, setMenusLoading] = useState(true);
  
  // Load dynamic menus for mobile
  useEffect(() => {
    const loadMobileMenus = async () => {
      try {
        setMenusLoading(true);
        const result = await menuService.getMenusByLocation('mobile');
        if (result.success && result.data && result.data.length > 0) {
          setMobileMenus(result.data);
        } else {
          setMobileMenus([]);
        }
      } catch (error) {
        console.error('Error loading mobile menus:', error);
        setMobileMenus([]);
      } finally {
        setMenusLoading(false);
      }
    };
    loadMobileMenus();
  }, []);

  // Track which sections have data and are visible
  const sectionsData = {
    hasProjects: projects && projects.length > 0 && getSetting('section_portfolio_visible') !== false,
    hasTechnologies: technologies && technologies.length > 0 && getSetting('section_technologies_visible') !== false,
    hasDomains: niches && niches.length > 0 && getSetting('section_domains_visible') !== false,
    hasGallery: getSetting('section_gallery_visible') !== false,
    loading: publicLoading
  };

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'portfolio', 'technologies', 'domains', 'process'];
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          scrollToSection(targetSection);
        }
        break;
      case 'contact':
        openContactForm();
        break;
      case 'start_project':
        setIsProjectFormOpen(true);
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
      case 'custom':
        if (menu.link_url) {
          if (menu.link_url.startsWith('#')) {
            // Anchor link - scroll to section
            const element = document.querySelector(menu.link_url);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          } else {
            // External link
            window.open(menu.link_url, '_blank', 'noopener,noreferrer');
          }
        }
        break;
      default:
        break;
    }
  };

  // Get icon component for menu
  const getMenuIcon = (menu) => {
    // If menu has icon emoji, return null (we'll display emoji separately)
    if (menu.icon && menu.icon.match(/[\u{1F300}-\u{1F9FF}]/u)) {
      return null;
    }
    
    // Map menu types to icons
    const iconMap = {
      'section': menu.section_id === 'hero' ? Home : Briefcase,
      'contact': Mail,
      'start_project': FileText,
      'call': Phone,
      'social_facebook': Facebook,
      'social_linkedin': Linkedin,
      'social_github': Github,
      'social_instagram': Instagram
    };
    
    return iconMap[menu.menu_type] || Briefcase;
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

  // Don't render navigation until we know what sections have data
  const showNavigation = !settingsLoading && settingsInitialized && !sectionsData.loading;

  // Build navigation items - use dynamic menus if available, otherwise use default logic
  const navItems = [];
  
  if (!menusLoading && mobileMenus.length > 0) {
    // Use dynamic menus
    mobileMenus.forEach((menu) => {
      const Icon = getMenuIcon(menu);
      navItems.push({
        id: menu.id,
        label: menu.label || '', // Allow empty label if icon is present
        icon: Icon,
        iconEmoji: menu.icon && menu.icon.match(/[\u{1F300}-\u{1F9FF}]/u) ? menu.icon : null,
        onClick: () => handleMenuClick(menu)
      });
    });
  } else {
    // Fallback to default navigation
    // Show call button if phone number is set
    if (getSetting('phone_number')) {
      navItems.push({
        id: 'call',
        label: 'Call',
        icon: Phone,
        onClick: handleCall
      });
    }
    
    // Always show contact
    navItems.push({
      id: 'contact',
      label: 'Contact',
      icon: Mail,
      onClick: () => setIsContactFormOpen(true)
    });

    // Always show process
    navItems.push({
      id: 'process',
      label: 'Process',
      icon: CheckCircle,
      onClick: () => scrollToSection('process')
    });

    // Conditionally show other items based on data availability
    if (sectionsData.hasProjects) {
      navItems.push({
        id: 'portfolio',
        label: 'Portfolio',
        icon: Briefcase,
        onClick: () => scrollToSection('portfolio')
      });
    }

    if (sectionsData.hasTechnologies) {
      navItems.push({
        id: 'technologies',
        label: 'Tech',
        icon: Code,
        onClick: () => scrollToSection('technologies')
      });
    }

    if (sectionsData.hasDomains) {
      navItems.push({
        id: 'domains',
        label: 'Domains',
        icon: Globe,
        onClick: () => scrollToSection('domains')
      });
    }

    if (sectionsData.hasGallery) {
      navItems.push({
        id: 'gallery',
        label: 'Gallery',
        icon: Image,
        onClick: () => scrollToSection('gallery')
      });
    }
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="backdrop-blur-sm border-t border-gray-200" style={{ 
          backgroundColor: 'white',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const showIconOnly = !item.label && (item.iconEmoji || Icon);
              
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={isActive ? { backgroundColor: 'var(--color-primary)' } : {}}
                >
                  {item.iconEmoji ? (
                    <span className="text-lg">{item.iconEmoji}</span>
                  ) : Icon ? (
                    <Icon size={18} />
                  ) : null}
                  {item.label && <span className="text-xs mt-1 font-bold">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contact Form */}
      <ContactForm isOpen={isContactFormOpen} onClose={() => setIsContactFormOpen(false)} />
      
      {/* Client Onboarding Form */}
      <ClientOnboardingForm isOpen={isProjectFormOpen} onClose={() => setIsProjectFormOpen(false)} />
    </>
  );
};

export default MobileBottomNav; 