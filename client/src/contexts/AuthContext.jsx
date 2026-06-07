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

  // Validate the stored token against the backend
  const validateToken = async () => {
    if (!token) return false;
    
    try {
      // Use a generous timeout for Render cold starts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.status === 401) {
        console.log('Token expired or invalid, logging out...');
        logout();
        return false;
      }

      if (!response.ok) return false;

      const data = await response.json();
      return data.valid;
    } catch (error) {
      // Network error or server unavailable — don't clear auth, just mark as unauthenticated
      console.warn('Token validation failed (network issue), keeping stored auth:', error.message);
      return 'keep-auth'; // Special sentinel: don't logout, but don't authenticate either
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!token || !user) {
        setIsAuthenticated(false);
        return;
      }

      const result = await validateToken();
      
      if (result === 'keep-auth') {
        // Network issue — keep token/user in storage but mark as not authenticated
        // User will be validated again on next page load
        setIsAuthenticated(false);
        return;
      }
      
      if (result) {
        setIsAuthenticated(true);
      } else {
        // validateToken already calls logout() for 401, so just set state
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [token, user]);

  // Sync token/user to localStorage — don't override auth state (checkAuth owns that)
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
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