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
      <header className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="relative w-12 h-8 flex items-center justify-center">
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
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#hero" className="text-white hover:text-white/80 transition-colors">
                Home
              </a>
              
              {showNavigation && sectionsData.hasProjects && (
                <button 
                  onClick={() => scrollToSection('portfolio')}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Portfolio
                </button>
              )}
              
              {showNavigation && sectionsData.hasTechnologies && (
                <button 
                  onClick={() => scrollToSection('technologies')}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Technologies
                </button>
              )}
              
              {showNavigation && sectionsData.hasDomains && (
                <button 
                  onClick={() => scrollToSection('domains')}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Domains
                </button>
              )}
              
              <button 
                onClick={() => scrollToSection('process')}
                className="text-white hover:text-white/80 transition-colors"
              >
                Process
              </button>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={openForm}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">Start Project</span>
              </button>
              
              <button
                onClick={openContactForm}
                className="bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Mail size={16} />
              </button>
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