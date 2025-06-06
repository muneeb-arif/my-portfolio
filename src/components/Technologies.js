import React from 'react';
import TechnologyCard from './TechnologyCard';
import { 
  Code, 
  Layers, 
  Database, 
  GitBranch, 
  Cloud, 
  Wrench,
  Link,
  Cpu
} from 'lucide-react';

const Technologies = () => {
  const technologiesData = [
    {
      icon: Code,
      title: 'Programming',
      technologies: ['JavaScript', 'TypeScript', 'PHP', 'Python'],
      backgroundImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: Layers,
      title: 'Frameworks',
      technologies: ['Next.js', 'NestJS', 'Laravel', 'Flask'],
      backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: Database,
      title: 'Databases',
      technologies: ['MySQL', 'PostgreSQL', 'Flask', 'Express'],
      backgroundImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: Link,
      title: 'ORM',
      technologies: ['Agile', 'Waterfall'],
      backgroundImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: Cpu,
      title: 'ARM',
      technologies: ['Agile', 'Waterfall'],
      backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: GitBranch,
      title: 'Version Control',
      technologies: ['AWS', 'Waterfall'],
      backgroundImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: Cloud,
      title: 'Cloud',
      technologies: ['AWS', 'DigitalOcean'],
      backgroundImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop&crop=center'
    },
    {
      icon: Wrench,
      title: 'Other',
      technologies: ['Jira', 'Vercel'],
      backgroundImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop&crop=center'
    }
  ];

  return (
    <section id="technologies" className="bg-sand-light py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, #C9A77D 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, #C9A77D 1px, transparent 1px)`,
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
            Domains & Technologies
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive overview of the technologies, frameworks, and methodologies I work with to bring ideas to life.
          </p>
        </div>

        {/* Technologies Grid - 4x2 layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {technologiesData.map((tech, index) => (
            <TechnologyCard
              key={index}
              icon={tech.icon}
              title={tech.title}
              technologies={tech.technologies}
              backgroundImage={tech.backgroundImage}
              animationDelay={index * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sand-dark to-transparent"></div>
    </section>
  );
};

export default Technologies; 