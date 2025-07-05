import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to get user from localStorage first
        const cachedUser = localStorage.getItem('supabaseUser');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
        // Always fetch fresh user from supabase
        const { data: { user }, error } = await supabase.auth.getUser();
        if (isMounted) {
          setUser(user);
          if (user) {
            localStorage.setItem('supabaseUser', JSON.stringify(user));
          } else {
            localStorage.removeItem('supabaseUser');
          }
          setError(error);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}; 