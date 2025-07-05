import React, { useState, useEffect } from 'react';
import ClientOnboardingForm from './ClientOnboardingForm';
import ContactForm from './ContactForm';
import { FileText, Mail } from 'lucide-react';
import { useSettings } from '../services/settingsContext';
import portfolioService from '../services/portfolioService';

const Header = ({ additionalDataLoading }) => {
  const { getSetting, loading: settingsLoading, initialized: settingsInitialized } = useSettings();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Track which sections have data
  const [sectionsData, setSectionsData] = useState({
    hasProjects: false,
    hasTechnologies: false,
    hasDomains: false,
    loading: false
  });

  // Handle scroll effect for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Wait for settings to load, then check data availability for each section
  useEffect(() => {
    if (!settingsLoading && settingsInitialized && !additionalDataLoading) {
      checkSectionsData();
    }
  }, [settingsLoading, settingsInitialized, additionalDataLoading]);

  const checkSectionsData = async () => {
    try {
      console.log('📊 Header: Checking sections data after settings and portfolio data are ready...');
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
      
      console.log('📊 Header: Sections data loaded:', {
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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Don't render navigation until we know what sections have data
  const showNavigation = !settingsLoading && settingsInitialized && !sectionsData.loading;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-sand-light/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sand-dark rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {getSetting('logo_initials') || 'MA'}
                </span>
              </div>
              <span className="text-sand-dark font-semibold text-lg">
                {getSetting('banner_name') || 'Portfolio'}
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#hero" className="text-sand-dark hover:text-sand-darker transition-colors">
                Home
              </a>
              
              {showNavigation && sectionsData.hasProjects && (
                <button 
                  onClick={() => scrollToSection('portfolio')}
                  className="text-sand-dark hover:text-sand-darker transition-colors"
                >
                  Portfolio
                </button>
              )}
              
              {showNavigation && sectionsData.hasTechnologies && (
                <button 
                  onClick={() => scrollToSection('technologies')}
                  className="text-sand-dark hover:text-sand-darker transition-colors"
                >
                  Technologies
                </button>
              )}
              
              {showNavigation && sectionsData.hasDomains && (
                <button 
                  onClick={() => scrollToSection('domains')}
                  className="text-sand-dark hover:text-sand-darker transition-colors"
                >
                  Domains
                </button>
              )}
              
              <button 
                onClick={() => scrollToSection('lifecycle')}
                className="text-sand-dark hover:text-sand-darker transition-colors"
              >
                Process
              </button>
              
              <button 
                onClick={openContactForm}
                className="text-sand-dark hover:text-sand-darker transition-colors flex items-center space-x-1"
              >
                <Mail size={16} />
                <span>Contact</span>
              </button>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={openForm}
                className="bg-sand-dark text-white px-4 py-2 rounded-lg hover:bg-sand-darker transition-colors flex items-center space-x-2"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">Get Started</span>
              </button>
              
              <button
                onClick={openContactForm}
                className="md:hidden bg-sand-dark text-white px-4 py-2 rounded-lg hover:bg-sand-darker transition-colors"
              >
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Client Onboarding Form */}
      {isFormOpen && (
        <ClientOnboardingForm onClose={closeForm} />
      )}

      {/* Contact Form */}
      {isContactFormOpen && (
        <ContactForm onClose={closeContactForm} />
      )}
    </>
  );
};

export default Header; 