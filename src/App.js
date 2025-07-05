import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/authContext';
import { PortfolioConfigProvider, usePortfolioConfig } from './services/portfolioConfigContext';
import { SettingsProvider, useSettings } from './services/settingsContext';
import { PortfolioDataProvider, usePortfolioData } from './services/portfolioDataContext';
import { registerContexts } from './services/contextAwareService';
import { supabase } from './config/supabase';
import Header from './components/Header';
import Hero from './components/Hero';
import PortfolioGrid from './components/PortfolioGrid';
import FilterMenu from './components/FilterMenu';
import Technologies from './components/Technologies';
import DomainsNiche from './components/DomainsNiche';
import ProjectLifeCycle from './components/ProjectLifeCycle';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Modal from './components/Modal';
import DynamicHead from './components/DynamicHead';
import Toast from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeDebugger from './components/ThemeDebugger';
import RainLoader from './components/RainLoader';
import Login from './components/dashboard/Login';
import DashboardLayout from './components/dashboard/DashboardLayout';
import { applyTheme } from './utils/themeUtils';
import './index.css';

// Wrapper component to register contexts
const AppWithContextRegistration = () => {
  const auth = useAuth();
  const portfolioConfig = usePortfolioConfig();
  
  // Register contexts with the service
  React.useEffect(() => {
    registerContexts(auth, portfolioConfig);
  }, [auth, portfolioConfig]);
  
  return <AppContent />;
};

// Main App Content Component
const AppContent = () => {
  const { settings, loading: settingsLoading } = useSettings();
  const { projects, projectsLoading } = usePortfolioData();
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Auth state management
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setSuccessMessage('Successfully logged in!');
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setSuccessMessage('Successfully signed out!');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  // Navigation between projects in modal
  const handleProjectNavigation = (direction) => {
    if (!selectedProject) return;

    const currentIndex = projects.findIndex(p => p.id === selectedProject.id);
    let newIndex;

    if (direction === 'next') {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev') {
      newIndex = currentIndex - 1;
    }

    // Check bounds
    if (newIndex >= 0 && newIndex < projects.length) {
      setSelectedProject(projects[newIndex]);
    }
  };

  // Check if navigation is possible
  const getNavigationState = () => {
    if (!selectedProject) return { canNavigateLeft: false, canNavigateRight: false };

    const currentIndex = projects.findIndex(p => p.id === selectedProject.id);
    return {
      canNavigateLeft: currentIndex > 0,
      canNavigateRight: currentIndex < projects.length - 1
    };
  };

  // Apply theme when settings change
  useEffect(() => {
    if (!settingsLoading && settings && settings.theme_name) {
      console.log('🎨 APP: Applying theme from settings:', settings.theme_name);
      applyTheme(settings.theme_name);
    }
  }, [settings, settingsLoading]);

  // Wait for settings to load before rendering
  if (settingsLoading) {
    return <RainLoader isLoading={true} message="Loading portfolio settings..." />;
  }

  // Dashboard route
  if (window.location.pathname.startsWith('/dashboard')) {
    if (authLoading) {
      return <RainLoader isLoading={true} message="Loading dashboard..." />;
    }

    if (!isAuthenticated) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
      <DashboardLayout 
        user={user} 
        onSignOut={handleSignOut}
        successMessage={successMessage}
        onClearSuccess={() => setSuccessMessage('')}
      />
    );
  }

  // Main portfolio site - filter projects based on active filter
  const filteredProjects = projects.filter(project => 
    activeFilter === 'All' || project.category === activeFilter
  );

  const categories = ['All', ...new Set(projects.map(project => project.category))];

  return (
    <div className="App">
      <DynamicHead />
      <Header />
      <main>
        <Hero isLoading={false} />
        {/* Always render PortfolioGrid - it handles its own loading state */}
        <FilterMenu 
          filters={categories}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        <PortfolioGrid 
          projects={filteredProjects}
          onProjectClick={handleProjectClick}
          isLoading={projectsLoading}
        />
        <Technologies />
        <DomainsNiche />
        <ProjectLifeCycle />
      </main>
      <Footer />
      <MobileBottomNav />
      <ScrollToTop />
      
      {selectedProject && (
        <Modal
          project={selectedProject}
          onClose={closeModal}
          onNavigate={handleProjectNavigation}
          {...getNavigationState()}
        />
      )}
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      
      {process.env.NODE_ENV === 'development' && <ThemeDebugger />}
    </div>
  );
};

// Main App Component with all providers
const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/*" element={
            <AuthProvider>
              <PortfolioConfigProvider>
                <SettingsProvider>
                  <PortfolioDataProvider>
                    <AppWithContextRegistration />
                  </PortfolioDataProvider>
                </SettingsProvider>
              </PortfolioConfigProvider>
            </AuthProvider>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App; 