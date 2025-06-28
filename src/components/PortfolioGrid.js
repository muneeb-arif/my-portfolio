import React from 'react';
import Card from './Card';
import SkeletonLoader from './SkeletonLoader';
import FadeInContent from './FadeInContent';

const PortfolioGrid = ({ projects, onProjectClick, isLoading = false }) => {
  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader type="project" count={6} />
          </div>
        </div>
      </section>
    );
  }

  const projectCards = projects.map((project) => (
    <Card key={project.id} project={project} onClick={() => onProjectClick(project)} />
  ));

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Featured Projects
        </h2>
        <FadeInContent 
          isLoading={isLoading}
          staggerChildren={true}
          staggerDelay={150}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projectCards}
        </FadeInContent>
      </div>
    </section>
  );
};

export default PortfolioGrid; 