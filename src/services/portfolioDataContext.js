import React, { createContext, useContext, useState, useEffect } from 'react';
import portfolioService from './portfolioService';

const PortfolioDataContext = createContext();

export const usePortfolioData = () => {
  const context = useContext(PortfolioDataContext);
  if (!context) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
  }
  return context;
};

export const PortfolioDataProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [technologiesLoading, setTechnologiesLoading] = useState(true);
  const [nichesLoading, setNichesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lazy load projects
  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      console.log('🚀 LAZY LOAD: Loading projects...');
      const projectsData = await portfolioService.getPublishedProjects();
      setProjects(projectsData || []);
      console.log(`✅ LAZY LOAD: Loaded ${projectsData?.length || 0} projects`);
    } catch (err) {
      console.error('❌ LAZY LOAD: Error loading projects:', err);
      setError(err);
    } finally {
      setProjectsLoading(false);
    }
  };

  // Lazy load technologies
  const loadTechnologies = async () => {
    try {
      setTechnologiesLoading(true);
      console.log('🚀 LAZY LOAD: Loading technologies...');
      const technologiesData = await portfolioService.getPublicDomainsTechnologies();
      setTechnologies(technologiesData || []);
      console.log(`✅ LAZY LOAD: Loaded ${technologiesData?.length || 0} technologies`);
    } catch (err) {
      console.error('❌ LAZY LOAD: Error loading technologies:', err);
      setError(err);
    } finally {
      setTechnologiesLoading(false);
    }
  };

  // Lazy load niches
  const loadNiches = async () => {
    try {
      setNichesLoading(true);
      console.log('🚀 LAZY LOAD: Loading niches...');
      const nichesData = await portfolioService.getPublicNiches();
      setNiches(nichesData || []);
      console.log(`✅ LAZY LOAD: Loaded ${nichesData?.length || 0} niches`);
    } catch (err) {
      console.error('❌ LAZY LOAD: Error loading niches:', err);
      setError(err);
    } finally {
      setNichesLoading(false);
    }
  };

  // Initial load - start lazy loading after a brief delay
  useEffect(() => {
    let isMounted = true;
    
    const startLazyLoading = async () => {
      // Small delay to let the main UI render first
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (isMounted) {
        console.log('🚀 LAZY LOAD: Starting lazy loading sequence...');
        
        // Load projects first (most important)
        await loadProjects();
        
        // Then load technologies and niches in parallel
        if (isMounted) {
          await Promise.all([
            loadTechnologies(),
            loadNiches()
          ]);
        }
        
        if (isMounted) {
          setLoading(false);
          console.log('✅ LAZY LOAD: All data loaded successfully');
        }
      }
    };

    startLazyLoading();
    
    return () => { isMounted = false; };
  }, []);

  return (
    <PortfolioDataContext.Provider value={{ 
      projects, 
      technologies, 
      niches, 
      loading, 
      projectsLoading,
      technologiesLoading,
      nichesLoading,
      error,
      loadProjects,
      loadTechnologies,
      loadNiches
    }}>
      {children}
    </PortfolioDataContext.Provider>
  );
}; 