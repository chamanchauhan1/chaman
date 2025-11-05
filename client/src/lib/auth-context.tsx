import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { supabase } from "@database/supabase-client";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAllStoredAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkSupabaseConfig: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch user profile from database
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            setUser(userData as User);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser(userData as User);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        setUser(userData as User);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      
      // Clear any stored auth data from localStorage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-localhost-auth-token');
      localStorage.removeItem('sb-localhost-auth-token-expires');
      localStorage.removeItem('sb-localhost-refresh-token');
      
      // Clear sessionStorage as well
      sessionStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('sb-localhost-auth-token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const clearAllStoredAuth = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all localStorage items that might contain auth data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies that might contain auth data
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.includes('supabase') || name.includes('sb-')) {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
      });
      
      // Reset user state
      setUser(null);
      
      console.log('All stored authentication data has been cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  };

  const checkSupabaseConfig = () => {
    try {
      const config = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        isConfigured: !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY
      };
      
      return config;
    } catch (error) {
      console.error('Error checking Supabase configuration:', error);
      return {
        supabaseUrl: null,
        supabaseAnonKey: null,
        hasSupabaseUrl: false,
        hasSupabaseAnonKey: false,
        isConfigured: false,
        error: error
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, clearAllStoredAuth, isAuthenticated: !!user, isLoading, checkSupabaseConfig }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
