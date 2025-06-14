import React, { useState, useEffect } from 'react';
import ClientOnboardingForm from './ClientOnboardingForm';
import ContactForm from './ContactForm';
import { Menu, X, FileText, Mail } from 'lucide-react';

const Header = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <>
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled 
            ? 'shadow-lg border-b border-gray-600/30' 
            : ''
          }
        `}
        style={{ backgroundColor: 'rgb(55 65 81 / var(--tw-bg-opacity, 1))' }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo/Brand */}
            <div className="flex items-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="relative text-4xl lg:text-5xl font-bold transition-all duration-500 cursor-pointer magnetic group"
                style={{ 
                  fontFamily: 'Playfair Display, serif',
                  letterSpacing: '0.15em',
                  color: '#F5E6D3',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4)) drop-shadow(0 0 12px rgba(245, 230, 211, 0.5))',
                  transform: 'perspective(1000px) rotateY(-5deg)',
                  textShadow: '2px 2px 0px rgba(240, 217, 184, 0.4)'
                }}
              >
                <span className="relative inline-block group-hover:scale-110 transition-transform duration-300">
                  M
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full opacity-70 animate-pulse"></span>
                </span>
                <span className="relative inline-block group-hover:scale-110 transition-transform duration-300 delay-75">
                  A
                  <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full opacity-60 animate-pulse delay-500"></span>
                </span>
                
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-desert-sand to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('portfolio')}
                className="text-sm font-medium transition-all duration-300 hover:scale-105 transform text-white/90 hover:text-white"
              >
                Portfolio
              </button>
              <button
                onClick={() => scrollToSection('technologies')}
                className="text-sm font-medium transition-all duration-300 hover:scale-105 transform text-white/90 hover:text-white"
              >
                Technologies
              </button>
              <button
                onClick={() => scrollToSection('domains')}
                className="text-sm font-medium transition-all duration-300 hover:scale-105 transform text-white/90 hover:text-white"
              >
                Domains
              </button>
              <button
                onClick={() => scrollToSection('process')}
                className="text-sm font-medium transition-all duration-300 hover:scale-105 transform text-white/90 hover:text-white"
              >
                Process
              </button>
            </nav>

            {/* CTA Buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={openContactForm}
                className="p-2 rounded-lg transition-all duration-300 hover:scale-110 transform text-white/90 hover:text-white hover:bg-white/10"
                title="Contact Me"
              >
                <Mail className="w-5 h-5" />
              </button>
              <button
                onClick={openForm}
                className="px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 transform flex items-center gap-2 bg-sand-dark text-white hover:bg-gray-600 shadow-lg hover:shadow-xl"
              >
                <FileText className="w-4 h-4" />
                Start Project
              </button>
            </div>

            {/* Mobile Start Project Button */}
            <button
              onClick={openForm}
              className="lg:hidden px-4 py-2 rounded-full font-medium text-xs transition-all duration-300 hover:scale-105 transform flex items-center gap-2 bg-sand-dark text-white hover:bg-gray-600 shadow-lg"
            >
              <FileText className="w-3 h-3" />
              Start Project
            </button>
          </div>
        </div>


      </header>

      {/* Contact Form Modal */}
      <ContactForm isOpen={isContactFormOpen} onClose={closeContactForm} />

      {/* Client Onboarding Form Modal */}
      <ClientOnboardingForm isOpen={isFormOpen} onClose={closeForm} />
    </>
  );
};

export default Header; 