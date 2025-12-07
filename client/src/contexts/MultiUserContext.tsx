import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Facilitator {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'facilitator';
  createdAt: string;
  lastLogin: string;
}

interface MultiUserContextType {
  currentUser: Facilitator | null;
  facilitators: Facilitator[];
  isAdmin: boolean;
  login: (name: string, email: string) => boolean;
  logout: () => void;
  registerFacilitator: (name: string, email: string) => boolean;
  deleteFacilitator: (id: string) => void;
  getAllFacilitators: () => Facilitator[];
}

const MultiUserContext = createContext<MultiUserContextType | undefined>(undefined);

const STORAGE_KEY = 'convivencia_facilitators';
const CURRENT_USER_KEY = 'convivencia_current_user';

const DEFAULT_ADMIN: Facilitator = {
  id: 'admin-001',
  name: 'Administrador',
  email: 'admin@convivencia.local',
  role: 'admin',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

export function MultiUserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Facilitator | null>(null);
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);

  // Initialize on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const currentUserStored = localStorage.getItem(CURRENT_USER_KEY);

    let allFacilitators: Facilitator[] = [];
    if (stored) {
      try {
        allFacilitators = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load facilitators', e);
        allFacilitators = [DEFAULT_ADMIN];
      }
    } else {
      allFacilitators = [DEFAULT_ADMIN];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allFacilitators));
    }

    setFacilitators(allFacilitators);

    if (currentUserStored) {
      try {
        const user = JSON.parse(currentUserStored);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to load current user', e);
      }
    }
  }, []);

  const login = (name: string, email: string): boolean => {
    const user = facilitators.find(f => f.email === email && f.name === name);
    if (user) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

      // Update last login in facilitators list
      const updated = facilitators.map(f => (f.id === user.id ? updatedUser : f));
      setFacilitators(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const registerFacilitator = (name: string, email: string): boolean => {
    // Check if email already exists
    if (facilitators.some(f => f.email === email)) {
      return false;
    }

    const newFacilitator: Facilitator = {
      id: `facilitator-${Date.now()}`,
      name,
      email,
      role: 'facilitator',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const updated = [...facilitators, newFacilitator];
    setFacilitators(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  };

  const deleteFacilitator = (id: string) => {
    if (id === 'admin-001') return; // Cannot delete admin
    const updated = facilitators.filter(f => f.id !== id);
    setFacilitators(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getAllFacilitators = () => facilitators;

  return (
    <MultiUserContext.Provider
      value={{
        currentUser,
        facilitators,
        isAdmin: currentUser?.role === 'admin' || false,
        login,
        logout,
        registerFacilitator,
        deleteFacilitator,
        getAllFacilitators,
      }}
    >
      {children}
    </MultiUserContext.Provider>
  );
}

export function useMultiUser() {
  const context = useContext(MultiUserContext);
  if (context === undefined) {
    throw new Error('useMultiUser must be used within MultiUserProvider');
  }
  return context;
}
