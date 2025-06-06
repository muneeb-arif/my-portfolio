import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import FilterMenu from './components/FilterMenu';
import PortfolioGrid from './components/PortfolioGrid';
import Modal from './components/Modal';

function App() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  const filters = ['All', 'Web Development', 'UI/UX Design', 'Backend'];

  // Sand particle trail effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const newMousePos = { x: e.clientX, y: e.clientY };
      setMousePosition(newMousePos);

      // Create more particles for denser effect
      const newParticles = [];
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          id: Date.now() + Math.random(),
          x: newMousePos.x + (Math.random() - 0.5) * 40,
          y: newMousePos.y + (Math.random() - 0.5) * 40,
          size: Math.random() * 8 + 3,
          opacity: Math.random() * 0.9 + 0.6,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 3 + 1,
          color: Math.random() > 0.3 ? '#C9A77D' : Math.random() > 0.5 ? '#B8936A' : '#E9CBA7',
          life: 90 // longer life for more density
        });
      }

      setParticles(prev => [...prev, ...newParticles].slice(-200)); // Keep max 200 particles
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          opacity: particle.opacity * 0.98, // Slower fade for more prominence
          life: particle.life - 1
        })).filter(particle => particle.life > 0 && particle.opacity > 0.05)
      );
    }, 16); // ~60fps

    return () => clearInterval(interval);
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

  return (
    <div className="min-h-screen bg-sand-light relative">
      {/* Sand Particle Trail Effect */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full shadow-lg"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              transform: `scale(${Math.max(particle.opacity, 0.3)})`,
              transition: 'none',
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color}80, 0 0 ${particle.size * 6}px ${particle.color}40`,
              border: `1px solid ${particle.color}60`
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

      {selectedProject && (
        <Modal 
          project={selectedProject}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default App; 