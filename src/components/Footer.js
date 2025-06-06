import React, { useState } from 'react';
import ClientOnboardingForm from './ClientOnboardingForm';
import ContactForm from './ContactForm';
import { FileText, Mail, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

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
    console.log('Scrolling to section:', sectionId);
    const element = document.getElementById(sectionId);
    console.log('Found element:', element);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      console.error('Element not found:', sectionId);
    }
  };

  return (
    <>
      <footer style={{ backgroundColor: 'rgb(55 65 81 / var(--tw-bg-opacity, 1))' }} className="py-12 relative overflow-hidden">
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
              <h3 className="text-2xl font-bold text-white mb-4">Muneeb Arif</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-md">
                Principal Software Engineer specializing in scalable web applications, 
                e-commerce solutions, and modern development practices. Let's bring your ideas to life.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={openContactForm}
                  className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer bg-transparent border-none p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                  title="Contact Me"
                >
                  <Mail className="w-5 h-5" />
                </button>
                <a 
                  href="https://github.com/muneebarif" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer inline-block p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                  title="GitHub Profile"
                  onClick={() => console.log('GitHub clicked')}
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com/in/muneebarif" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer inline-block p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                  title="LinkedIn Profile"
                  onClick={() => console.log('LinkedIn clicked')}
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com/muneebarif" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/70 hover:text-white transition-all duration-300 cursor-pointer inline-block p-2 rounded-lg hover:bg-white/10 hover:scale-110 transform"
                  title="Twitter Profile"
                  onClick={() => console.log('Twitter clicked')}
                >
                  <Twitter className="w-5 h-5" />
                </a>
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
              © 2024 Muneeb Arif. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <button 
                onClick={() => {
                  console.log('Privacy button clicked');
                  alert('Privacy Policy: This portfolio website collects no personal data. All form submissions are for demonstration purposes only.');
                }}
                className="text-white/60 hover:text-white text-sm transition-all duration-300 cursor-pointer bg-transparent border-none px-3 py-2 rounded-lg hover:bg-white/5 hover:scale-105 transform hover:shadow-lg"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => {
                  console.log('Terms button clicked');
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

      {/* Contact Form Modal */}
      <ContactForm isOpen={isContactFormOpen} onClose={closeContactForm} />
    </>
  );
};

export default Footer; 