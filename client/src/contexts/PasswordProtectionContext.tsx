import React, { createContext, useContext, useState, useEffect } from 'react';

interface PasswordProtectionContextType {
  isProtected: boolean;
  isAuthenticated: boolean;
  authenticate: (password: string) => boolean;
  logout: () => void;
}

const PasswordProtectionContext = createContext<PasswordProtectionContextType | undefined>(undefined);

const CORRECT_PASSWORD = 'Sercade2026';
const AUTH_KEY = 'convivencia_auth';

export function PasswordProtectionProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProtected] = useState(true);

  // Check if already authenticated on mount
  useEffect(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const authenticate = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <PasswordProtectionContext.Provider
      value={{
        isProtected,
        isAuthenticated,
        authenticate,
        logout,
      }}
    >
      {children}
    </PasswordProtectionContext.Provider>
  );
}

export function usePasswordProtection() {
  const context = useContext(PasswordProtectionContext);
  if (!context) {
    throw new Error('usePasswordProtection must be used within PasswordProtectionProvider');
  }
  return context;
}
