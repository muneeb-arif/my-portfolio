import React, { useState } from 'react';
import Hero from './components/Hero';
import FilterMenu from './components/FilterMenu';
import PortfolioGrid from './components/PortfolioGrid';
import Modal from './components/Modal';

function App() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  const filters = ['All', 'Web Development', 'UI/UX Design', 'Backend'];

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
    <div className="min-h-screen bg-sand-light">
      <Hero />
      <div className="container mx-auto px-4 py-16">
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