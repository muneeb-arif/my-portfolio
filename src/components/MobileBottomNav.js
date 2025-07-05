import React, { useState, useEffect } from 'react';
import { Briefcase, Code, Globe, CheckCircle, Mail } from 'lucide-react';
import ContactForm from './ContactForm';
import { useSettings } from '../services/settingsContext';
import portfolioService from '../services/portfolioService';

const MobileBottomNav = ({ additionalDataLoading }) => {
  const { loading: settingsLoading, initialized: settingsInitialized } = useSettings();
  const [activeSection, setActiveSection] = useState('hero');
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  
  // Track which sections have data
  const [sectionsData, setSectionsData] = useState({
    hasProjects: false,
    hasTechnologies: false,
    hasDomains: false,
    loading: false
  });

  // Wait for settings to load, then check data availability for each section
  useEffect(() => {
    if (!settingsLoading && settingsInitialized && !additionalDataLoading) {
      checkSectionsData();
    }
  }, [settingsLoading, settingsInitialized, additionalDataLoading]);

  const checkSectionsData = async () => {
    try {
      console.log('📊 MobileBottomNav: Checking sections data after settings and portfolio data are ready...');
      setSectionsData(prev => ({ ...prev, loading: true }));
      
      const [projects, technologies, domains] = await Promise.all([
        portfolioService.getPublishedProjects(),
        portfolioService.getDomainsTechnologies(),
        portfolioService.getNiches()
      ]);

      setSectionsData({
        hasProjects: projects && projects.length > 0,
        hasTechnologies: technologies && technologies.length > 0,
        hasDomains: domains && domains.length > 0,
        loading: false
      });
      
      console.log('📊 MobileBottomNav: Sections data loaded:', {
        hasProjects: projects && projects.length > 0,
        hasTechnologies: technologies && technologies.length > 0,
        hasDomains: domains && domains.length > 0,
      });
    } catch (error) {
      console.error('Error checking sections data:', error);
      setSectionsData({
        hasProjects: false,
        hasTechnologies: false,
        hasDomains: false,
        loading: false
      });
    }
  };

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'portfolio', 'technologies', 'domains', 'lifecycle'];
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
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
  };

  // Don't render navigation until we know what sections have data
  const showNavigation = !settingsLoading && settingsInitialized && !sectionsData.loading;

  // Build navigation items based on available data
  const navItems = [];
  
  // Always show home
  navItems.push({
    id: 'hero',
    label: 'Home',
    icon: CheckCircle,
    onClick: () => scrollToSection('hero')
  });

  // Add sections that have data
  if (showNavigation) {
    if (sectionsData.hasProjects) {
      navItems.push({
        id: 'portfolio',
        label: 'Projects',
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

    // Always show process
    navItems.push({
      id: 'lifecycle',
      label: 'Process',
      icon: CheckCircle,
      onClick: () => scrollToSection('lifecycle')
    });
  }

  // Always show contact
  navItems.push({
    id: 'contact',
    label: 'Contact',
    icon: Mail,
    onClick: openContactForm
  });

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-sand-light/95 backdrop-blur-sm border-t border-sand-dark/20 shadow-lg">
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-sand-dark bg-sand-dark/10' 
                      : 'text-sand-dark/60 hover:text-sand-dark'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contact Form */}
      {isContactFormOpen && (
        <ContactForm onClose={closeContactForm} />
      )}
    </>
  );
};

export default MobileBottomNav; 