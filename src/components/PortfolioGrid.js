import React from 'react';
import Card from './Card';

const PortfolioGrid = ({ projects, onProjectClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <Card
          key={project.id}
          project={project}
          onClick={() => onProjectClick(project)}
          animationDelay={index * 0.1}
        />
      ))}
    </div>
  );
};

export default PortfolioGrid; 