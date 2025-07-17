import React from 'react';
import Card from './Card';
import SkeletonLoader from './SkeletonLoader';

const PortfolioGrid = ({ projects, onProjectClick, activeFilter, loading }) => {
  console.log('[PortfolioGrid] Received projects:', projects);
  if (loading) {
    return (
      <section id="portfolio" className="py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
              Portfolio
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Loading portfolio projects...
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Hide the entire section if no projects data
  // if (!loading && projects.length === 0) {
  //   return null;
  // }

  return (
    <section id="portfolio" className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 2px 2px, #C9A77D 2px, transparent 0)`,
               backgroundSize: '30px 30px'
             }}>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
            Portfolio
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            A showcase of projects that demonstrate my expertise in creating impactful digital solutions.
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map((project, index) => (
              <Card
                key={project.id}
                project={project}
                onClick={() => onProjectClick(project)}
                animationDelay={index * 0.1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Found</h3>
            <p className="text-gray-600 mb-4">
              No projects have been published yet.
            </p>
            <p className="text-sm text-gray-500">
              Projects added through the dashboard will appear here once published.
            </p>
          </div>
        )}
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sand-dark to-transparent"></div>
    </section>
  );
};

export default PortfolioGrid; 