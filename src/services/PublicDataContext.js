import React, { createContext, useContext, useEffect, useState } from 'react';
import portfolioService from './portfolioService';

const PublicDataContext = createContext();

export const usePublicData = () => useContext(PublicDataContext);

export const PublicDataProvider = ({ children }) => {
  const [data, setData] = useState({
    projects: [],
    technologies: [],
    niches: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setData(d => ({ ...d, loading: true, error: null }));
        const [projects, technologies, niches] = await Promise.all([
          portfolioService.getPublishedProjects(),
          portfolioService.getDomainsTechnologies(),
          portfolioService.getNiches(),
        ]);
        if (isMounted) {
          setData({ projects, technologies, niches, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setData(d => ({ ...d, loading: false, error }));
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  return (
    <PublicDataContext.Provider value={data}>
      {children}
    </PublicDataContext.Provider>
  );
}; 