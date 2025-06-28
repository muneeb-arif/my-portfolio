import React, { useState } from 'react';
import ClientOnboardingForm from './ClientOnboardingForm';
import { FileText, Mail, Github, Instagram } from 'lucide-react';
import { useSettings } from '../services/settingsContext';

const Footer = () => {
  const { getSetting } = useSettings();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  // Email click handler
  const handleEmailClick = () => {
    const mailtoLink = `mailto:${getSetting('social_email')}?subject=${encodeURIComponent('Get Started - TheExpertWays.com')}`;
    window.location.href = mailtoLink;
  };

  // Smooth scroll to section function
  const scrollToSection = (sectionId) => {
      // console.log('Scrolling to section:', sectionId);
    const element = document.getElementById(sectionId);
      // console.log('Found element:', element);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // console.error('Element not found:', sectionId);
    }
  };

  return (
    <>
      <footer className="py-12 relative overflow-hidden theme-footer">
        {/* Background Pattern - Behind content */}
        <div className="absolute inset-0 opacity-5 z-0 pointer-events-none">
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                 radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                 backgroundSize: '50px 50px'
               }}>
          </div>
        </div>

        {/* Main Content - Above background */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Section */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">Portfolio</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-md">
                Principal Software Engineer specializing in scalable web applications, 
                e-commerce solutions, and modern development practices. Let's bring your ideas to life.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={handleEmailClick}
                  className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                  title="Contact Me"
                >
                  <Mail className="w-5 h-5" />
                </button>
                {getSetting('social_github') && (
                  <a 
                    href={getSetting('social_github')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer inline-block p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                    title="GitHub Profile"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {getSetting('social_instagram') && (
                  <a 
                    href={getSetting('social_instagram')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer inline-block p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                    title="Instagram Profile"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {getSetting('social_facebook') && (
                  <a 
                    href={getSetting('social_facebook')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer inline-block p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                    title="Facebook Profile"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => scrollToSection('portfolio')}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                  >
                    Portfolio
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-16"></span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('technologies')}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                  >
                    Technologies
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-20"></span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('domains')}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                  >
                    Domains
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-16"></span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('process')}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                  >
                    Process
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-14"></span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => scrollToSection('domains')}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                  >
                    Web Development
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-28"></span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('domains')}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                  >
                    E-commerce Solutions
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-32"></span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('domains')}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 text-left cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative group"
                  >
                    API Development
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-26"></span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={openForm}
                    className="text-white/70 hover:text-white text-sm transition-all duration-300 flex items-center gap-2 group cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/5 hover:translate-x-2 transform relative"
                  >
                    <FileText className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    Client Onboarding Form
                    <span className="absolute bottom-0 left-2 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-36"></span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 text-sm mb-4 md:mb-0">
              {getSetting('copyright_text')}
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <button 
                onClick={() => {
      // console.log('Privacy button clicked');
                  alert('Privacy Policy: This portfolio website collects no personal data. All form submissions are for demonstration purposes only.');
                }}
                className="text-white/60 hover:text-white text-sm transition-all duration-300 cursor-pointer bg-transparent border-none px-3 py-2 rounded-lg hover:bg-white/5 hover:scale-105 transform hover:shadow-lg"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => {
      // console.log('Terms button clicked');
                  alert('Terms of Service: This portfolio is for demonstration purposes. For actual project terms, please contact directly.');
                }}
                className="text-white/60 hover:text-white text-sm transition-all duration-300 cursor-pointer bg-transparent border-none px-3 py-2 rounded-lg hover:bg-white/5 hover:scale-105 transform hover:shadow-lg"
              >
                Terms of Service
              </button>
              <button 
                onClick={openForm}
                className="text-white/60 hover:text-white text-sm transition-all duration-300 cursor-pointer bg-transparent border-none px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-sand-dark/20 hover:to-sand/20 hover:scale-105 transform hover:shadow-lg border border-transparent hover:border-white/20"
              >
                Start Project
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Client Onboarding Form Modal */}
      <ClientOnboardingForm isOpen={isFormOpen} onClose={closeForm} />
    </>
  );
};

export default Footer; 