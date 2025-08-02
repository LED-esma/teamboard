import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { firebaseAuth } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// User interface
interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'editor' | 'viewer';
  displayName?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  // Convert Firebase Auth user to app user
  const toAppUser = (firebaseUser: any): User => ({
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: firebaseUser.displayName || firebaseUser.email || '',
    role: 'viewer',
    displayName: firebaseUser.displayName || firebaseUser.email || ''
  });

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser(toAppUser(firebaseUser));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const authResult = await firebaseAuth.signIn(email, password);
      if (!authResult.success) {
        return { success: false, error: authResult.error || 'Authentication failed' };
      }
      setUser(toAppUser(authResult.user));
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await firebaseAuth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 