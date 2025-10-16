import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL, DEVELOPMENT_MODE } from '../config/constants.js';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start as false

  // Logout function (defined early so it can be used in effects)
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Check if backend server is available
  const checkBackendAvailability = async () => {
    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );
      
      // Try to fetch from any endpoint to check if server is running
      const fetchPromise = fetch(`${API_BASE_URL}/health`, {
        method: 'GET'
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      return response.ok;
    } catch (error) {
      console.log('Backend not available:', error.message);
      return false;
    }
  };

  // Clear any stored auth on app load if backend not available
  useEffect(() => {
    const initializeAuth = async () => {
      const isBackendAvailable = await checkBackendAvailability();
      if (!isBackendAvailable && (token || user)) {
        console.log('Backend not available on startup, clearing stored auth');
        logout();
      }
    };
    
    initializeAuth();
  }, []); // Run once on mount

  // Add token validation
  const validateToken = async () => {
    if (!token) return false;
    
    // Skip validation if running frontend-only (no backend)
    const isBackendAvailable = await checkBackendAvailability();
    if (!isBackendAvailable) {
      console.log('Backend not available, skipping token validation');
      // Return false for frontend-only mode - require fresh login
      return false;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        // If 401, token is invalid, clear auth state
        if (response.status === 401) {
          console.log('Token expired or invalid, logging out...');
          logout();
        }
        return false;
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      // Network error or server unavailable
      console.error('Token validation error (network issue):', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Always start with no authentication in frontend-only mode
      if (!token || !user) {
        setIsAuthenticated(false);
        return;
      }

      // Check if backend is available first
      const isBackendAvailable = await checkBackendAvailability();
      
      if (!isBackendAvailable) {
        console.log('Backend not available, clearing auth state for frontend-only mode');
        // Clear authentication state when backend is not available
        logout();
        return;
      }

      // Only validate token if backend is available
      try {
        const isValid = await validateToken();
        setIsAuthenticated(isValid);
        if (!isValid) {
          logout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    };
    
    // Check authentication on load
    checkAuth();
  }, [token, user]);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [token, user]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const value = {
    token,
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}