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

  // Check if user exists in database
  const checkUserInDatabase = async (firebaseUser: any): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: userData.username || userData.email || '',
          role: userData.role || 'viewer',
          displayName: userData.displayName || userData.username || ''
        };
      }
      
      // User not found in database
      console.log('User not found in controlled database:', firebaseUser.email);
      return null;
    } catch (error) {
      console.error('Error checking user in database:', error);
      return null;
    }
  };

  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase, check if they exist in our database
        const controlledUser = await checkUserInDatabase(firebaseUser);
        
        if (controlledUser) {
          setUser(controlledUser);
        } else {
          // User exists in Firebase but not in our controlled database
          // Sign them out automatically
          await firebaseAuth.signOut();
          setUser(null);
        }
      } else {
        // User is signed out
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
      
      // First, try to authenticate with Firebase
      const authResult = await firebaseAuth.signIn(email, password);
      
      if (!authResult.success) {
        return { success: false, error: authResult.error || 'Authentication failed' };
      }

      // Check if user exists in database
      const controlledUser = await checkUserInDatabase(authResult.user);
      
      if (!controlledUser) {
        // User authenticated with Firebase but not in database
        await firebaseAuth.signOut();
        return { 
          success: false, 
          error: 'Access denied. Please contact your administrator to create an account.' 
        };
      }

      setUser(controlledUser);
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