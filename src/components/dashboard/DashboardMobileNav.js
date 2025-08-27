import React, { useState } from 'react';
import { Phone, MoreHorizontal, X } from 'lucide-react';
import { useSettings } from '../../services/settingsContext';

const DashboardMobileNav = ({ activeSection, onNavClick, navItems }) => {
  const { getSetting } = useSettings();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Filter navItems to only show the 5 specified items for mobile
  // Note: navItems are already filtered by parent DashboardLayout based on section visibility
  // So sections with is_on_frontend=false will automatically be hidden here
  const mobileNavItems = navItems.filter(item => 
    ['projects', 'gallery', 'settings', 'appearance', 'categories'].includes(item.id)
  );

  const handleCall = () => {
    const phoneNumber = getSetting('phone_number');
    if (phoneNumber) {
      // Remove any non-digit characters except + for tel: links
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  return (
    <>
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
            
            {/* More Button */}
            <button
              onClick={() => setShowMoreMenu(true)}
              className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-800"
              title="More options"
            >
              <MoreHorizontal size={20} />
              <span className="text-xs mt-1 font-bold">More</span>
            </button>
            
            {/* Call Button - Only show when phone number is set */}
            {getSetting('phone_number') && (
              <button
                onClick={handleCall}
                className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-800"
                title={`Call ${getSetting('phone_number')}`}
              >
                <Phone size={20} />
                <span className="text-xs mt-1 font-bold">Call</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Sliding More Menu */}
      {showMoreMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMoreMenu(false)}
          />
          
          {/* Sliding Menu */}
          <div className={`fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            showMoreMenu ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Dashboard Menu</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Menu Items */}
            <div className="py-4 overflow-y-auto max-h-[calc(100vh-80px)]">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavClick(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {item.adminOnly && (
                      <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardMobileNav; 