
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useRouter, usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Protection logic: Redirect to /auth if not logged in and not on a public route
      const isPublicRoute = pathname === '/' || pathname === '/auth';
      if (!currentUser && !isPublicRoute) {
        router.push('/auth');
      }
      
      // Redirect away from /auth if already logged in
      if (currentUser && pathname === '/auth') {
        router.push('/analyzer');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#020408] flex flex-col items-center justify-center">
        <div className="relative p-8 bg-destructive/10 rounded-3xl border border-destructive/20 text-destructive animate-pulse">
          <Shield className="h-16 w-16" />
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.5em] text-destructive">
          Authenticating ShieldCore Node...
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
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
