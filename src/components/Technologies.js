import React from 'react';
import TechnologyCard from './TechnologyCard';
import { usePortfolioData } from '../services/portfolioDataContext';

const Technologies = () => {
  const { technologies: technologiesData, technologiesLoading } = usePortfolioData();

  if (technologiesLoading) {
    return (
      <section id="technologies" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
              Technologies
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Loading technologies...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sand-dark"></div>
          </div>
        </div>
      </section>
    );
  }

  // Hide the entire section if no technologies data
  if (!technologiesLoading && technologiesData.length === 0) {
    return null;
  }

  return (
    <section id="technologies" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
            Technologies
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the cutting-edge technologies I work with
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {technologiesData.map((tech, index) => (
            <TechnologyCard
              key={tech.id}
              icon={tech.icon}
              title={tech.title}
              technologies={tech.tech_skills || []}
              backgroundImage={tech.image || `/images/domains/${tech.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpeg`}
              animationDelay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Technologies; 