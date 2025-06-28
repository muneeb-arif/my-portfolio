import React, { useState, useEffect } from 'react';
import { Briefcase, Code, Globe, CheckCircle, Mail } from 'lucide-react';
import ContactForm from './ContactForm';
import portfolioService from '../services/portfolioService';

const MobileBottomNav = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  
  // Track which sections have data
  const [sectionsData, setSectionsData] = useState({
    hasProjects: false,
    hasTechnologies: false,
    hasDomains: false,
    loading: true
  });

  // Check data availability for each section
  useEffect(() => {
    const checkSectionsData = async () => {
      try {
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
      } catch (error) {
        // console.error('Error checking sections data:', error);
        setSectionsData({
          hasProjects: false,
          hasTechnologies: false,
          hasDomains: false,
          loading: false
        });
      }
    };

    checkSectionsData();
  }, []);

  // Track which section is currently in view
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-100px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe sections
    const sections = ['portfolio', 'technologies', 'domains', 'process'];
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Smooth scroll to section function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Contact form handlers
  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
  };

  const navItems = [
    ...(sectionsData.hasProjects ? [{
      id: 'portfolio',
      icon: Briefcase,
      label: 'Portfolio',
      action: () => {
        setActiveSection('portfolio');
        scrollToSection('portfolio');
      }
    }] : []),
    ...(sectionsData.hasTechnologies ? [{
      id: 'technologies',
      icon: Code,
      label: 'Tech',
      action: () => {
        setActiveSection('technologies');
        scrollToSection('technologies');
      }
    }] : []),
    ...(sectionsData.hasDomains ? [{
      id: 'domains',
      icon: Globe,
      label: 'Domains',
      action: () => {
        setActiveSection('domains');
        scrollToSection('domains');
      }
    }] : []),
    {
      id: 'process',
      icon: CheckCircle,
      label: 'Process',
      action: () => {
        setActiveSection('process');
        scrollToSection('process');
      }
    },
    {
      id: 'contact',
      icon: Mail,
      label: 'Contact',
      action: () => {
        setActiveSection('contact');
        openContactForm();
      }
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-lg border-t border-gray-200"></div>
      
      {/* Navigation container */}
      <div className="relative flex items-center justify-around py-2 px-4 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id || (item.id === 'contact' && activeSection === '');
          
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`
                flex flex-col items-center justify-center py-2 px-3 rounded-xl
                transition-all duration-300 transform min-w-0 flex-1 max-w-[70px]
                ${isActive 
                  ? 'bg-sand-dark text-white scale-105 shadow-lg' 
                  : 'text-gray-600 hover:text-sand-dark hover:bg-sand-light/50'
                }
              `}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform duration-300`} />
              <span className={`text-xs font-medium leading-none ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Home indicator (like iPhone) */}
      <div className="flex justify-center pb-1">
        <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
      </div>

      {/* Contact Form Modal */}
      <ContactForm isOpen={isContactFormOpen} onClose={closeContactForm} />
    </div>
  );
};

export default MobileBottomNav; 