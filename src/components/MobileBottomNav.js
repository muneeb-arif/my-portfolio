import React, { useState, useEffect } from 'react';
import { Briefcase, Code, Globe, CheckCircle, Mail } from 'lucide-react';
import ContactForm from './ContactForm';
import { useSettings } from '../services/settingsContext';
import { usePublicData } from '../services/PublicDataContext';

const MobileBottomNav = ({ additionalDataLoading }) => {
  const { loading: settingsLoading, initialized: settingsInitialized } = useSettings();
  const { projects, technologies, niches, loading: publicLoading } = usePublicData();
  const [activeSection, setActiveSection] = useState('hero');
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  
  // Track which sections have data
  const sectionsData = {
    hasProjects: projects && projects.length > 0,
    hasTechnologies: technologies && technologies.length > 0,
    hasDomains: niches && niches.length > 0,
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
                  <Icon size={18} />
                  <span className="text-xs mt-1 font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Contact Form */}
      <ContactForm isOpen={isContactFormOpen} onClose={closeContactForm} />
    </>
  );
};

export default MobileBottomNav; 