import React from 'react';
import { Home, FileText, Users, Settings } from 'lucide-react';

const BottomNav = ({ currentView, setCurrentView }) => {
  // Don't show navigation during onboarding
  if (currentView === 'onboarding') return null;

  const navItems = [
    { 
      key: 'dashboard', 
      icon: Home, 
      label: 'Dashboard',
      description: 'Overview and progress'
    },
    { 
      key: 'documents', 
      icon: FileText, 
      label: 'Documents',
      description: 'Upload and manage documents'
    },
    { 
      key: 'family-tree', 
      icon: Users, 
      label: 'Family',
      description: 'Manage family members'
    },
    { 
      key: 'settings', 
      icon: Settings, 
      label: 'Settings',
      description: 'App settings and data'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map(({ key, icon: Icon, label, description }) => {
            const isActive = currentView === key;
            
            return (
              <button
                key={key}
                onClick={() => setCurrentView(key)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 group ${
                  isActive 
                    ? 'text-yellow-600 bg-yellow-50' 
                    : 'text-gray-600 hover:text-yellow-500 hover:bg-gray-50'
                }`}
                aria-label={`Navigate to ${label}: ${description}`}
              >
                <div className={`transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  <Icon 
                    size={20} 
                    className={`mb-1 ${
                      isActive ? 'text-yellow-600' : 'text-gray-600 group-hover:text-yellow-500'
                    }`} 
                  />
                </div>
                <span className={`text-xs font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-yellow-600' 
                    : 'text-gray-600 group-hover:text-yellow-500'
                }`}>
                  {label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-yellow-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Safe area padding for devices with home indicators */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
};

export default BottomNav;
