import React from 'react';

// Icon mapping for string to component conversion
const getIconComponent = (iconName) => {
  const iconMap = {
    'Code': () => <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    'Smartphone': () => <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    'Cpu': () => <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
    'Cloud': () => <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>,
    'Link': () => <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    'Shield': () => <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    'BarChart': () => <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    'Settings': () => <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    'Monitor': () => <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  };
  
  return iconMap[iconName] || iconMap['Code']; // Default to Code icon
};

const TechnologyCard = ({ icon, title, technologies, backgroundImage, animationDelay }) => {
  // Handle icon - convert string to component if needed
  const renderIcon = () => {
    if (typeof icon === 'string') {
      const IconFunction = getIconComponent(icon);
      return <IconFunction />;
    } else if (icon) {
      const IconComponent = icon;
      return <IconComponent className="w-7 h-7 text-white" />;
    } else {
      // Default fallback icon
      return <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
    }
  };
  const getSkillBoxOpacity = (level) => {
    // 5 = 100% filled (darkest), 1 = 25% filled (lightest)
    const opacityMap = {
      1: 0.25,
      2: 0.4,
      3: 0.6,
      4: 0.8,
      5: 1.0
    };
    return opacityMap[level] || 0.25;
  };

  return (
    <div
      className="relative group overflow-hidden rounded-xl transform transition-all duration-300 hover:scale-103 hover:shadow-2xl cursor-pointer min-h-[280px] opacity-100"
    >
      {/* Background Image - Optimized */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105 opacity-40"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'brightness(0.7)'
        }}
      />
      
      {/* Single Uniform Overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgb(55 65 81 / 0.9)' }} />
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 border border-white/20">
            {renderIcon()}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white text-center mb-6 group-hover:text-white transition-colors duration-300">
          {title}
        </h3>

        {/* Technologies List with Skill Level Fill */}
        <div className="space-y-3 flex-1">
          {technologies && technologies.length > 0 ? technologies.map((tech, index) => (
            <div
              key={index}
              className="text-sm text-white/95 text-center py-2 px-3 rounded-lg border border-white/10 transition-all duration-300"
              style={{
                backgroundColor: `rgba(255, 255, 255, ${getSkillBoxOpacity(tech.level || 3) * 0.25})`,
                backdropFilter: 'blur(10px)'
              }}
            >
              {tech.title || tech.name || 'Unknown Skill'}
            </div>
          )) : (
            <div className="text-sm text-white/70 text-center py-2 px-3 rounded-lg border border-white/10">
              No skills available
            </div>
          )}
        </div>
      </div>

      {/* Simple Border */}
      <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40 transition-colors duration-300" />
    </div>
  );
};

export default TechnologyCard; 