import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import FilterMenu from './components/FilterMenu';
import PortfolioGrid from './components/PortfolioGrid';
import Modal from './components/Modal';
import Technologies from './components/Technologies';
import DomainsNiche from './components/DomainsNiche';
import ProjectLifeCycle from './components/ProjectLifeCycle';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './components/dashboard/Dashboard';
import DynamicHead from './components/DynamicHead';
import Toast from './components/Toast';
import ToastContainer from './components/ToastContainer';
import RainLoader from './components/RainLoader';
import portfolioService from './services/portfolioService';
import { SettingsProvider, useSettings } from './services/settingsContext';
import { AuthProvider } from './services/authContext';
import { checkEnvMissing } from './config/supabase';

// Route detector component
function RouteHandler() {
  const location = useLocation();
  
  // Check if we're on dashboard route (handles both /dashboard and /#/dashboard)
  const isDashboard = location.pathname === '/dashboard' || 
                     window.location.hash === '#/dashboard' ||
                     window.location.pathname === '/dashboard';
  
  console.log('🔍 RouteHandler - Location:', location.pathname);
  console.log('🔍 RouteHandler - Hash:', window.location.hash);
  console.log('🔍 RouteHandler - isDashboard:', isDashboard);
  
  // Handle hash routing redirect
  useEffect(() => {
    if (window.location.hash === '#/dashboard' && location.pathname !== '/dashboard') {
      console.log('🔄 Redirecting from hash to path routing');
      window.history.replaceState(null, '', '/dashboard');
    }
  }, [location.pathname]);
  
  if (isDashboard) {
    return <Dashboard />;
  }
  
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

function App() {
  // Debug logging
  console.log('🔍 App.js - Current URL:', window.location.href);
  console.log('🔍 App.js - Pathname:', window.location.pathname);
  console.log('🔍 App.js - Hash:', window.location.hash);
  
  // Handle initial hash routing
  useEffect(() => {
    if (window.location.hash === '#/dashboard') {
      console.log('🔄 Initial hash routing detected, redirecting to path routing');
      window.history.replaceState(null, '', '/dashboard');
      window.location.reload();
    }
  }, []);
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Main portfolio route */}
          <Route path="/" element={
            <SettingsProvider>
              <AppContent />
            </SettingsProvider>
          } />
          
          {/* Catch-all route that handles both normal and hash routing */}
          <Route path="*" element={<RouteHandler />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Separate component that can use useSettings hook
function AppContent() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [particles, setParticles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [additionalDataLoading, setAdditionalDataLoading] = useState(false);
  const [showEnvToast, setShowEnvToast] = useState(false);

  const { loading: settingsLoading, initialized: settingsInitialized, settings } = useSettings();

  // Get section visibility settings with defaults
  const sectionVisibility = {
    hero: settings.section_hero_visible !== undefined ? settings.section_hero_visible : true,
    portfolio: settings.section_portfolio_visible !== undefined ? settings.section_portfolio_visible : true,
    technologies: settings.section_technologies_visible !== undefined ? settings.section_technologies_visible : true,
    domains: settings.section_domains_visible !== undefined ? settings.section_domains_visible : true,
    projectCycle: settings.section_project_cycle_visible !== undefined ? settings.section_project_cycle_visible : true,
  };

  // Check for missing environment variables on app load
  useEffect(() => {
    if (checkEnvMissing()) {
      // Show toast after a short delay to ensure app is loaded
      const timer = setTimeout(() => {
        setShowEnvToast(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Define loadPortfolioData function first
  const loadPortfolioData = useCallback(async () => {
    try {
      console.log('📊 Loading portfolio data after settings are ready...');
      setAdditionalDataLoading(true);
      
      // Load different sections with staggered timing for better UX
      const [projectsData, categoriesData] = await Promise.all([
        portfolioService.getPublishedProjects(),
        portfolioService.getCategories()
      ]);

      // Always use the actual data from the database (even if empty)
      setProjects(projectsData || []);
      
      // Transform categories to filter format: ['All', 'Category1', 'Category2', ...]
      const categoryNames = categoriesData?.map(cat => cat.name || cat) || [];
      const filters = ['All', ...categoryNames];
      setFilters(filters);

      console.log(`📊 Loaded ${projectsData?.length || 0} published projects`);
      console.log(`📁 Loaded ${categoryNames.length} categories:`, categoryNames);
      console.log(`🔍 Filters set to:`, filters);
      
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      setProjects([]);
      setFilters(['All']);
    } finally {
      setAdditionalDataLoading(false);
    }
  }, []);

  // Hide the main loader with 1 second delay after settings are loaded
  useEffect(() => {
    if (settingsLoading) {
      // Show loader immediately when settings start loading
      setLoading(true);
    } else {
      // Add 1 second delay before hiding loader when settings finish loading
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [settingsLoading]);

  // Wait for settings to load, then load portfolio data and initialize theme updates
  useEffect(() => {
    if (!settingsLoading && settingsInitialized) {
      // Settings are loaded, now load portfolio data in background
      loadPortfolioData();
    }
  }, [settingsLoading, settingsInitialized, loadPortfolioData]);

  // Handle filter changes
  const handleFilterChange = async (newFilter) => {
    setActiveFilter(newFilter);
    
    try {
      const filteredProjects = await portfolioService.getPublishedProjectsByCategory(newFilter);
      console.log('📊 Filtered projects:', filteredProjects);
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error filtering projects:', error);
      // Fallback to client-side filtering
      const allProjects = await portfolioService.getPublishedProjects();
      const filtered = newFilter === 'All' 
        ? allProjects 
        : allProjects.filter(project => project.category === newFilter);
      setProjects(filtered);
    }
  };

  // Note: Removed fallback projects - now shows true empty state when no data exists

  // Initialize floating sand particles
  // useEffect(() => {
  //   const generateParticles = () => {
  //     const newParticles = [];
  //     const particleCount = 40; // Reduced for better performance

  //     for (let i = 0; i < particleCount; i++) {
  //       newParticles.push({
  //         id: i,
  //         x: Math.random() * 100,
  //         y: Math.random() * 100,
  //         size: Math.random() * 8 + 3, // Slightly smaller
  //         opacity: Math.random() * 0.6 + 0.3,
  //         speedX: (Math.random() - 0.5) * 0.6, // Reduced speed
  //         speedY: (Math.random() - 0.5) * 0.4,
  //         color: ['#E9CBA7', '#C9A77D', '#B8936A', '#F5E6D3'][Math.floor(Math.random() * 4)],
  //         layer: Math.random() > 0.4 ? 'front' : 'back',
  //         rotationSpeed: (Math.random() - 0.5) * 1.5,
  //         rotation: 0,
  //         baseOpacity: Math.random() * 0.6 + 0.3,
  //         // Pre-calculate wandering properties
  //         wanderAngle: Math.random() * Math.PI * 2,
  //         wanderRadius: Math.random() * 0.3 + 0.2,
  //         wanderSpeed: Math.random() * 0.015 + 0.008,
  //         lastDirectionChange: 0
  //       });
  //     }
  //     setParticles(newParticles);
  //   };

  //   // generateParticles();
  // }, []);

  // Disabled animation loop to prevent infinite re-renders
  // useEffect(() => { 
  //   let animationId;
  //   let lastTime = 0;
  //   const targetFPS = 12;
  //   const interval = 1000 / targetFPS;

  //   const animate = (currentTime) => {
  //     if (currentTime - lastTime >= interval) {
  //       setParticles(prev => 
  //         prev.map(particle => {
  //           // ... animation logic
  //         })
  //       );
  //       lastTime = currentTime;
  //     }
  //     animationId = requestAnimationFrame(animate);
  //   };

  //   animationId = requestAnimationFrame(animate);
  //   return () => cancelAnimationFrame(animationId);
  // }, []);

  const filteredProjects = projects; // Projects are already filtered by the service

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  // Navigation between projects in modal
  const handleProjectNavigation = (direction) => {
    if (!selectedProject) return;

    const currentIndex = projects.findIndex(p => p.id === selectedProject.id);
    let newIndex;

    if (direction === 'next') {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev') {
      newIndex = currentIndex - 1;
    }

    // Check bounds
    if (newIndex >= 0 && newIndex < projects.length) {
      setSelectedProject(projects[newIndex]);
    }
  };

  // Check if navigation is possible
  const getNavigationState = () => {
    if (!selectedProject) return { canNavigateLeft: false, canNavigateRight: false };

    const currentIndex = projects.findIndex(p => p.id === selectedProject.id);
    return {
      canNavigateLeft: currentIndex > 0,
      canNavigateRight: currentIndex < projects.length - 1
    };
  };

  return (
    <>
      <DynamicHead />
      <ToastContainer />
      <div className="App">
        {/* iOS-style Full Screen Loading - Hide as soon as settings load */}
        <RainLoader 
          isLoading={loading} 
          message="Loading settings..." 
        />

        {/* Environment Variables Missing Toast */}
        {showEnvToast && (
          <Toast
            message="Missing .env file with Supabase credentials. The app is running in demo mode with fallback data."
            type="warning"
            duration={10000}
            onClose={() => setShowEnvToast(false)}
          />
        )}

        {/* Header */}
        <Header additionalDataLoading={additionalDataLoading} />

        {/* Floating Sand Particles - Back Layer */}
        <div className="fixed inset-0 pointer-events-none z-10">
          {particles.filter(p => p.layer === 'back').map(particle => (
            <div
              key={`back-${particle.id}`}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size * 0.9}px`,
                height: `${particle.size * 0.9}px`,
                backgroundColor: particle.color,
                opacity: particle.opacity * 0.7,
                transform: `rotate(${particle.rotation}deg)`,
                transition: 'none',
              }}
            />
          ))}
        </div>

        {/* Hero Section */}
        {sectionVisibility.hero && <Hero />}

        {/* Portfolio Section */}
        {sectionVisibility.portfolio && (
          <>
            {/* Filter Menu */}
            <FilterMenu
              filters={filters}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />

            {/* Portfolio Grid */}
            <PortfolioGrid
              projects={filteredProjects}
              onProjectClick={handleProjectClick}
              activeFilter={activeFilter}
              loading={additionalDataLoading}
            />
          </>
        )}

        {/* Technologies Section */}
        {sectionVisibility.technologies && (
          <Technologies additionalDataLoading={additionalDataLoading} />
        )}

        {/* Domains & Niche Section */}
        {sectionVisibility.domains && (
          <DomainsNiche additionalDataLoading={additionalDataLoading} />
        )}

        {/* Project Life Cycle */}
        {sectionVisibility.projectCycle && <ProjectLifeCycle />}

        {/* Footer */}
        <Footer />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav additionalDataLoading={additionalDataLoading} />

        {/* Scroll to Top Button */}
        <ScrollToTop />

        {/* Floating Sand Particles - Front Layer */}
        <div className="fixed inset-0 pointer-events-none z-30">
          {particles.filter(p => p.layer === 'front').map(particle => (
            <div
              key={`front-${particle.id}`}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                opacity: particle.opacity * 0.9,
                transform: `rotate(${particle.rotation}deg)`,
                transition: 'none',
              }}
            />
          ))}
        </div>

        {/* Project Modal */}
        {selectedProject && (
          <Modal
            project={selectedProject}
            onClose={closeModal}
            onNavigate={handleProjectNavigation}
            canNavigateLeft={getNavigationState().canNavigateLeft}
            canNavigateRight={getNavigationState().canNavigateRight}
          />
        )}
      </div>
    </>
  );
}

export default App; 