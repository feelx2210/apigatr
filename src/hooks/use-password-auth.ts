import { useState, useEffect } from 'react';
import { GATE_CONFIG } from '@/config/gate-access';

export const usePasswordAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const sessionData = localStorage.getItem(GATE_CONFIG.sessionKey);
      if (sessionData) {
        const { timestamp } = JSON.parse(sessionData);
        
        // Check if session has expired (if expiry is set)
        if (GATE_CONFIG.sessionExpiryHours > 0) {
          const expiryTime = timestamp + (GATE_CONFIG.sessionExpiryHours * 60 * 60 * 1000);
          if (Date.now() > expiryTime) {
            logout();
            return;
          }
        }
        
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (password: string): boolean => {
    if (password === GATE_CONFIG.password) {
      const sessionData = {
        authenticated: true,
        timestamp: Date.now()
      };
      localStorage.setItem(GATE_CONFIG.sessionKey, JSON.stringify(sessionData));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(GATE_CONFIG.sessionKey);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};