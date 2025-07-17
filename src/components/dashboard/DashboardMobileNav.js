import React from 'react';

const DashboardMobileNav = ({ activeSection, onNavClick, navItems }) => {
  // Filter navItems to only show the 5 specified items for mobile
  const mobileNavItems = navItems.filter(item => 
    ['projects', 'prompts', 'queries', 'media', 'categories'].includes(item.id)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="backdrop-blur-sm border-t border-gray-200" style={{ 
        backgroundColor: 'white',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <div className="flex justify-around items-center py-2">
          {mobileNavItems.map((item) => {
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavClick(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={isActive ? { backgroundColor: 'var(--color-primary)' } : {}}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs mt-1 font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default DashboardMobileNav; 