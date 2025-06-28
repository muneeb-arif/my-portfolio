import React, { useState, useEffect } from 'react';
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
import Dashboard from './components/dashboard/Dashboard';
import DynamicHead from './components/DynamicHead';
import Toast from './components/Toast';
import RainLoader from './components/RainLoader';
import portfolioService from './services/portfolioService';
import { SettingsProvider } from './services/settingsContext';
import { checkEnvMissing } from './config/supabase';

function App() {
  // Check if we're on the dashboard route
  const isDashboard = window.location.pathname === '/dashboard';
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [particles, setParticles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [showEnvToast, setShowEnvToast] = useState(false);

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

  // Load projects and categories on component mount
  useEffect(() => {
    if (!isDashboard) {
      loadPortfolioData();
    }
  }, [isDashboard]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Load different sections with staggered timing for better UX
      const [projectsData, categoriesData] = await Promise.all([
        portfolioService.getPublishedProjects(),
        portfolioService.getAvailableCategories()
      ]);

      // Always use the actual data from the database (even if empty)
      setProjects(projectsData || []);
      setFilters(categoriesData || ['All']);

      // console.log(`📊 Loaded ${projectsData?.length || 0} published projects`);
      // console.log(`📁 Loaded ${(categoriesData?.length || 1) - 1} categories`); // -1 for 'All'
      
    } catch (error) {
      // console.error('Error loading portfolio data:', error);
      setProjects([]);
      setFilters(['All']);
    } finally {
      // Add a minimum loading time for smooth UX
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Note: Removed fallback projects - now shows true empty state when no data exists

  // Handle filter changes
  const handleFilterChange = async (newFilter) => {
    setActiveFilter(newFilter);
    
    if (!isDashboard) {
      try {
        const filteredProjects = await portfolioService.getPublishedProjectsByCategory(newFilter);
        setProjects(filteredProjects);
      } catch (error) {
      // console.error('Error filtering projects:', error);
        // Fallback to client-side filtering
        const allProjects = await portfolioService.getPublishedProjects();
        const filtered = newFilter === 'All' 
          ? allProjects 
          : allProjects.filter(project => project.category === newFilter);
        setProjects(filtered);
      }
    }
  };

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

  // Optimized animation with requestAnimationFrame
  useEffect(() => { 
    let animationId;
    let lastTime = 0;
    const targetFPS = 12; // Reduced FPS for better performance
    const interval = 1000 / targetFPS;

    const animate = (currentTime) => {
      if (currentTime - lastTime >= interval) {
        setParticles(prev => 
          prev.map(particle => {
            // Less frequent direction changes
            const timeSinceLastChange = currentTime - particle.lastDirectionChange;
            const shouldChangeDirection = timeSinceLastChange > 3000 && Math.random() < 0.01;
            
            let newSpeedX = particle.speedX;
            let newSpeedY = particle.speedY;
            let lastDirectionChange = particle.lastDirectionChange;
            
            if (shouldChangeDirection) {
              newSpeedX = (Math.random() - 0.5) * 0.6;
              newSpeedY = (Math.random() - 0.5) * 0.4;
              lastDirectionChange = currentTime;
            }

            // Simplified wandering
            const wanderX = Math.cos(particle.wanderAngle) * particle.wanderRadius * 0.5;
            const wanderY = Math.sin(particle.wanderAngle) * particle.wanderRadius * 0.5;

            return {
              ...particle,
              x: (particle.x + newSpeedX + wanderX + 100) % 100,
              y: (particle.y + newSpeedY + wanderY + 100) % 100,
              speedX: newSpeedX,
              speedY: newSpeedY,
              rotation: particle.rotation + particle.rotationSpeed,
              wanderAngle: particle.wanderAngle + particle.wanderSpeed,
              lastDirectionChange,
              // Simplified opacity animation
              opacity: particle.baseOpacity + Math.sin(currentTime * 0.002 + particle.id) * 0.15
            };
          })
        );
        lastTime = currentTime;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

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

  // If dashboard route, show dashboard
  if (isDashboard) {
    return <Dashboard />;
  }

  return (
    <SettingsProvider>
      <DynamicHead />
      <div className="App">
        {/* iOS-style Full Screen Loading */}
        <RainLoader isLoading={loading} message="Loading your portfolio..." />

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
        <Header />

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
                filter: 'blur(0.5px)'
              }}
            />
          ))}
        </div>

        {/* Floating Sand Particles - Front Layer */}
        <div className="fixed inset-0 pointer-events-none z-40">
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
                opacity: particle.opacity,
                transform: `rotate(${particle.rotation}deg)`,
                transition: 'none',
                boxShadow: `0 0 ${particle.size}px ${particle.color}40`
              }}
            />
          ))}
        </div>

        <Hero />
        
        {/* Portfolio Section with Textural Background */}
        <div className="relative overflow-hidden">
          {/* Textural Background Elements */}
          <div className="absolute inset-0">
            {/* Subtle Sand Dune Pattern */}
            <div className="absolute inset-0 opacity-30">
              <svg width="100%" height="100%" viewBox="0 0 1000 800" className="absolute inset-0">
                <defs>
                  <pattern id="sandTexture" patternUnits="userSpaceOnUse" width="100" height="100">
                    <rect width="100" height="100" fill="#F5E6D3"/>
                    <circle cx="20" cy="20" r="1" fill="#C9A77D" opacity="0.6"/>
                    <circle cx="80" cy="40" r="0.5" fill="#B8936A" opacity="0.7"/>
                    <circle cx="40" cy="70" r="1.5" fill="#C9A77D" opacity="0.5"/>
                    <circle cx="70" cy="10" r="0.8" fill="#B8936A" opacity="0.6"/>
                    <circle cx="10" cy="60" r="1.2" fill="#E9CBA7" opacity="0.8"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#sandTexture)"/>
              </svg>
            </div>

            {/* Geometric Sand Patterns */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" viewBox="0 0 400 400" className="absolute inset-0">
                <defs>
                  <pattern id="hexPattern" patternUnits="userSpaceOnUse" width="60" height="52">
                    <polygon points="30,5 50,20 50,35 30,50 10,35 10,20" 
                             fill="none" stroke="#C9A77D" strokeWidth="1" opacity="0.8"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexPattern)"/>
              </svg>
            </div>

            {/* Flowing Sand Waves */}
            <div className="absolute inset-0 opacity-25">
              <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
                <path d="M0,200 Q300,150 600,200 T1200,200 L1200,300 Q900,250 600,300 T0,300 Z" 
                      fill="rgba(201, 167, 125, 0.3)"/>
                <path d="M0,400 Q400,350 800,400 T1200,400 L1200,500 Q800,450 400,500 T0,500 Z" 
                      fill="rgba(233, 203, 167, 0.2)"/>
                <path d="M0,600 Q200,550 600,600 T1200,600 L1200,700 Q600,650 200,700 T0,700 Z" 
                      fill="rgba(184, 147, 106, 0.4)"/>
              </svg>
            </div>

            {/* Scattered Dots for Texture */}
            <div className="absolute inset-0 opacity-40">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-wet-sand"
                  style={{
                    width: Math.random() * 4 + 2 + 'px',
                    height: Math.random() * 4 + 2 + 'px',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.6 + 0.3
                  }}
                />
              ))}
            </div>

            {/* Additional Visible Sand Grains */}
            <div className="absolute inset-0 opacity-35">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() * 6 + 3 + 'px',
                    height: Math.random() * 6 + 3 + 'px',
                    backgroundColor: `rgba(${184 + Math.random() * 40}, ${147 + Math.random() * 40}, ${106 + Math.random() * 40}, ${0.3 + Math.random() * 0.4})`,
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                  }}
                />
              ))}
            </div>

            {/* Gradient Overlay for Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-sand-light/30 via-transparent to-sand-light/20"></div>
          </div>

          {/* Portfolio Content */}
          <div className="relative z-10 container mx-auto px-4 py-16">
            <FilterMenu 
              filters={filters} 
              activeFilter={activeFilter} 
              onFilterChange={handleFilterChange}
            />
            
            {filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-warm-brown mb-2">No Projects Found</h3>
                <p className="text-gray-600 mb-4">
                  {activeFilter === 'All' 
                    ? "No published projects available yet."
                    : `No projects found in "${activeFilter}" category.`
                  }
                </p>
                <button 
                  onClick={() => handleFilterChange('All')}
                  className="text-warm-brown hover:underline"
                >
                  View All Projects
                </button>
              </div>
            ) : (
              <PortfolioGrid 
                projects={filteredProjects}
                onProjectClick={handleProjectClick}
              />
            )}
          </div>
        </div>

        {/* Technologies Section */}
        <Technologies />

        {/* Domains / Niche Section */}
        <DomainsNiche />

        {/* Project Delivery Life Cycle Section */}
        <ProjectLifeCycle />

        {/* Footer */}
        <Footer />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {selectedProject && (
          <Modal
            project={selectedProject}
            onClose={closeModal}
            onNavigate={handleProjectNavigation}
            {...getNavigationState()}
          />
        )}
      </div>
    </SettingsProvider>
  );
}

export default App; 