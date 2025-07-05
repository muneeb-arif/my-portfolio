import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './authContext';

const PortfolioConfigContext = createContext();

export const usePortfolioConfig = () => {
  const context = useContext(PortfolioConfigContext);
  if (!context) {
    throw new Error('usePortfolioConfig must be used within a PortfolioConfigProvider');
  }
  return context;
};

export const PortfolioConfigProvider = ({ children }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to get config from localStorage first
        const cachedConfig = localStorage.getItem('portfolioConfig');
        if (cachedConfig) {
          setConfig(JSON.parse(cachedConfig));
        }
        // Always fetch fresh config from supabase
        let email = user?.email;
        if (!email) {
          setConfig(null);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('portfolio_config')
          .select('*')
          .eq('owner_email', email)
          .eq('is_active', true)
          .single();
        if (isMounted) {
          setConfig(data);
          if (data) {
            localStorage.setItem('portfolioConfig', JSON.stringify(data));
          } else {
            localStorage.removeItem('portfolioConfig');
          }
          setError(error);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (user) fetchConfig();
    else setLoading(false);
    return () => { isMounted = false; };
  }, [user]);

  return (
    <PortfolioConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </PortfolioConfigContext.Provider>
  );
}; 