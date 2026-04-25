'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = localStorage.getItem('shieldcore_auth');
    if (auth) {
      setIsAuthenticated(true);
      setUser(JSON.parse(auth));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const publicRoutes = ['/', '/login'];
      
      // If not authenticated and trying to access a private route, go to login
      if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        router.push('/login');
      }

      // If already authenticated and visiting the login page, go to the dashboard (analyzer)
      if (isAuthenticated && pathname === '/login') {
        router.push('/analyzer');
      }
    }
  }, [isAuthenticated, pathname, isLoading, router]);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (email === 'admin@shieldcore.ai' && password === 'shieldcore@2026') {
      const userData = { email };
      localStorage.setItem('shieldcore_auth', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      
      // Explicitly redirect to the analyzer page after success
      router.push('/analyzer');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('shieldcore_auth');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
