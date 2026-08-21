// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        authAPI.getCurrentUser()
          .then(response => {
            if (response) {
              setUser(response);
              localStorage.setItem('user', JSON.stringify(response));
            }
          })
          .catch(() => {
            logout();
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (err) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      
      // Store user data
      const userData = response.user || response;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, data: response };
    } catch (err) {
      // REMOVED :any - this is plain JavaScript now
      const errorMsg = err.response?.data?.detail || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setError(null);
  };

  const hasAccess = (requiredRoles) => {
    if (!user) return false;
    if (requiredRoles.includes('*')) return true;
    const userRole = (user.role || '').toLowerCase();
    return requiredRoles.includes(userRole);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasAccess,
    userRole: user?.role || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};