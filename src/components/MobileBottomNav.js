import React, { useState, useEffect } from 'react';
import { Briefcase, Code, Globe, CheckCircle, Mail } from 'lucide-react';
import ContactForm from './ContactForm';

const MobileBottomNav = () => {
  const [activeSection, setActiveSection] = useState('');
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

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
    {
      id: 'portfolio',
      icon: Briefcase,
      label: 'Portfolio',
      action: () => {
        setActiveSection('portfolio');
        scrollToSection('portfolio');
      }
    },
    {
      id: 'technologies',
      icon: Code,
      label: 'Tech',
      action: () => {
        setActiveSection('technologies');
        scrollToSection('technologies');
      }
    },
    {
      id: 'domains',
      icon: Globe,
      label: 'Domains',
      action: () => {
        setActiveSection('domains');
        scrollToSection('domains');
      }
    },
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