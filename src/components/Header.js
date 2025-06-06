import React, { useState, useEffect } from 'react';
import ClientOnboardingForm from './ClientOnboardingForm';
import ContactForm from './ContactForm';
import { Menu, X, FileText, Mail } from 'lucide-react';

const Header = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const openContactForm = () => {
    setIsContactFormOpen(true);
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
                className="text-2xl lg:text-3xl font-bold transition-colors duration-300 cursor-pointer text-white hover:text-white/90"
              >
                Muneeb Arif
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

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg transition-colors duration-300 text-white/90 hover:text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`
            lg:hidden overflow-hidden transition-all duration-300 border-t border-white/20
            ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
          `}
          style={{ backgroundColor: 'rgb(55 65 81 / var(--tw-bg-opacity, 1))' }}
        >
          <div className="container mx-auto px-4 py-6">
            <nav className="space-y-4">
              <button
                onClick={() => scrollToSection('portfolio')}
                className="block w-full text-left text-white/90 hover:text-white font-medium py-2 transition-colors duration-300"
              >
                Portfolio
              </button>
              <button
                onClick={() => scrollToSection('technologies')}
                className="block w-full text-left text-white/90 hover:text-white font-medium py-2 transition-colors duration-300"
              >
                Technologies
              </button>
              <button
                onClick={() => scrollToSection('domains')}
                className="block w-full text-left text-white/90 hover:text-white font-medium py-2 transition-colors duration-300"
              >
                Domains
              </button>
              <button
                onClick={() => scrollToSection('process')}
                className="block w-full text-left text-white/90 hover:text-white font-medium py-2 transition-colors duration-300"
              >
                Process
              </button>
              
              {/* Mobile CTA Buttons */}
              <div className="pt-4 border-t border-white/20 space-y-3">
                <button
                  onClick={openContactForm}
                  className="flex items-center gap-3 w-full text-left text-white/90 hover:text-white font-medium py-2 transition-colors duration-300"
                >
                  <Mail className="w-5 h-5" />
                  Contact Me
                </button>
                <button
                  onClick={openForm}
                  className="flex items-center gap-3 w-full bg-sand-dark text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gray-600"
                >
                  <FileText className="w-5 h-5" />
                  Start Project
                </button>
              </div>
            </nav>
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