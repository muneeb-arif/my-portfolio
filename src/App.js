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

function App() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [particles, setParticles] = useState([]);

  const filters = ['All', 'Web Development', 'UI/UX Design', 'Backend'];

  // Initialize floating sand particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      const particleCount = 40; // Reduced for better performance

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 8 + 3, // Slightly smaller
          opacity: Math.random() * 0.6 + 0.3,
          speedX: (Math.random() - 0.5) * 0.6, // Reduced speed
          speedY: (Math.random() - 0.5) * 0.4,
          color: ['#E9CBA7', '#C9A77D', '#B8936A', '#F5E6D3'][Math.floor(Math.random() * 4)],
          layer: Math.random() > 0.4 ? 'front' : 'back',
          rotationSpeed: (Math.random() - 0.5) * 1.5,
          rotation: 0,
          baseOpacity: Math.random() * 0.6 + 0.3,
          // Pre-calculate wandering properties
          wanderAngle: Math.random() * Math.PI * 2,
          wanderRadius: Math.random() * 0.3 + 0.2,
          wanderSpeed: Math.random() * 0.015 + 0.008,
          lastDirectionChange: 0
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

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

  const projects = [
    {
      id: 1,
      title: 'Explore Heaven Pakistan',
      description: 'A responsive website for travel enthusiasts',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center',
      buttonText: 'View Demo',
      details: {
        overview: 'A comprehensive travel platform showcasing the beautiful landscapes and destinations of Pakistan. Built with modern web technologies to provide an immersive user experience.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
        features: ['Interactive maps', 'Booking system', 'User reviews', 'Mobile responsive design'],
        liveUrl: '#',
        githubUrl: '#'
      }
    },
    {
      id: 2,
      title: 'E-commerce Platform',
      description: 'A scalable e-commerce web application',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&crop=center',
      buttonText: 'View Details',
      details: {
        overview: 'A full-featured e-commerce platform with advanced shopping cart functionality, payment processing, and inventory management.',
        technologies: ['React', 'Express.js', 'PostgreSQL', 'Stripe API'],
        features: ['Shopping cart', 'Payment integration', 'Admin dashboard', 'Order tracking'],
        liveUrl: '#',
        githubUrl: '#'
      }
    },
    {
      id: 3,
      title: 'Travel Website',
      description: 'A responsive website for travel enthusiasts',
      category: 'UI/UX Design',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop&crop=center',
      buttonText: 'View Demo',
      details: {
        overview: 'A modern travel website design focused on user experience and visual storytelling to inspire wanderlust.',
        technologies: ['Figma', 'Adobe XD', 'React', 'Framer Motion'],
        features: ['Interactive prototypes', 'Mobile-first design', 'Accessibility compliant', 'Performance optimized'],
        liveUrl: '#',
        githubUrl: '#'
      }
    },
    {
      id: 4,
      title: 'Finance App',
      description: 'A finance app with clean currency ui',
      category: 'Backend',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center',
      buttonText: 'View Details',
      details: {
        overview: 'A sophisticated financial management application with real-time data processing and secure transaction handling.',
        technologies: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Celery'],
        features: ['Real-time analytics', 'Secure transactions', 'API integration', 'Automated reports'],
        liveUrl: '#',
        githubUrl: '#'
      }
    },
    {
      id: 5,
      title: 'Portfolio Website',
      description: 'My personal portfolio website',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop&crop=center',
      buttonText: 'View Demo',
      details: {
        overview: 'A personal portfolio website showcasing my skills, projects, and experience as a full-stack developer.',
        technologies: ['React', 'Tailwind CSS', 'Vercel', 'Netlify'],
        features: ['Responsive design', 'Dark mode', 'Contact form', 'SEO optimized'],
        liveUrl: '#',
        githubUrl: '#'
      }
    },
    {
      id: 6,
      title: 'Task Management System',
      description: 'A collaborative project management tool',
      category: 'Web Development',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center',
      buttonText: 'View Details',
      details: {
        overview: 'A comprehensive task management system designed for teams to collaborate effectively and track project progress.',
        technologies: ['Vue.js', 'Laravel', 'MySQL', 'Socket.io'],
        features: ['Real-time collaboration', 'Task tracking', 'Team management', 'Progress analytics'],
        liveUrl: '#',
        githubUrl: '#'
      }
    }
  ];

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

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
    <div className="min-h-screen bg-sand-light relative overflow-hidden">
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
            onFilterChange={setActiveFilter}
          />
          <PortfolioGrid 
            projects={filteredProjects}
            onProjectClick={handleProjectClick}
          />
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

      {selectedProject && (
        <Modal 
          project={selectedProject}
          onClose={closeModal}
          onNavigate={handleProjectNavigation}
          {...getNavigationState()}
        />
      )}
    </div>
  );
}

export default App; 