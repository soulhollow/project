import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import AGBPopup from '../components/AGBPopup';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAGB, setShowAGB] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const checkAGBStatus = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('agb_accepted')
        .eq('id', userId)
        .single();
        
      if (!error && profile && !profile.agb_accepted) {
        setShowAGB(true);
      }
    } catch (error) {
      console.error('Error checking AGB status:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Test Supabase connection
        const { error: connectionError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
          .single();

        if (connectionError) {
          if (connectionError.message.includes('FetchError')) {
            throw new Error('Unable to connect to Supabase. Please check your internet connection.');
          }
          if (connectionError.message.includes('JWT')) {
            throw new Error('Authentication error. Please check your Supabase configuration.');
          }
          throw connectionError;
        }

        // Get the initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          // Clear any stale session data
          await supabase.auth.signOut();
          if (mounted) {
            setUser(null);
          }
          return;
        }

        if (session?.user && mounted) {
          setUser(session.user);
          await checkAGBStatus(session.user.id);
        }
      } catch (error: any) {
        console.error('Error checking auth session:', error);
        setConnectionError(error.message);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await checkAGBStatus(session.user.id);
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setShowAGB(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }

      setLoading(false);
    });

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setShowAGB(false);
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, we should clear the local state
      setUser(null);
      setShowAGB(false);
      throw error;
    }
  };

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{connectionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const value = {
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {showAGB && <AGBPopup onAccept={() => setShowAGB(false)} />}
      {!loading && children}
    </AuthContext.Provider>
  );
};