'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          setUser(session.user);
          
          // Refresh session if it's about to expire
          const expiresAt = session.expires_at;
          const timeNow = Math.floor(Date.now() / 1000);
          const timeUntilExpire = expiresAt - timeNow;
          
          // If session expires in less than 60 minutes, refresh it
          if (timeUntilExpire < 3600) {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Error refreshing session:', refreshError);
            } else if (refreshData && refreshData.session) {
              // Update user with refreshed session data
              setUser(refreshData.session.user);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
        setSessionChecked(true);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setUser(session.user);
        } else if (event === 'USER_UPDATED' && session) {
          setUser(session.user);
        }
        
        setLoading(false);
      }
    );

    // Set up periodic session refresh (every 30 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Error during periodic session refresh:', error);
          }
        }
      } catch (error) {
        console.error('Error during periodic session refresh:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, username, fullName) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName
          },
          persistSession: true
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Store user email in localStorage for the confirmation page
        try {
          localStorage.setItem('userInfo', JSON.stringify({ email }));
        } catch (err) {
          console.error('Error storing email in localStorage:', err);
        }
        
        // Create user profile
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              username,
              full_name: fullName,
              email,
              created_at: new Date().toISOString(),
            });

          if (profileError) {
            // Check if it's the permission denied error for auth.users table
            if (profileError.code === '42501' && profileError.message?.includes('permission denied for table users')) {
              // This is expected and can be ignored - the trigger will handle profile creation
              console.log('Profile creation will be handled by database trigger');
            } else {
              console.error('Error creating profile:', profileError);
              // Continue with signup even if profile creation fails
            }
          }
        } catch (profileError) {
          // Check if it's the permission denied error for auth.users table
          if (profileError.code === '42501' && profileError.message?.includes('permission denied for table users')) {
            // This is expected and can be ignored - the trigger will handle profile creation
            console.log('Profile creation will be handled by database trigger');
          } else {
            console.error('Error creating profile:', profileError);
            // Continue with signup even if profile creation fails
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Verify email with OTP
  const verifyOtp = async (email, otp) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use Supabase's built-in verification token method
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
        options: {
          persistSession: true
        }
      });
      
      if (error) throw error;
      
      // Update user state if verification is successful
      if (data && data.user) {
        setUser(data.user);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error verifying email:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Resend verification email
  const resendVerification = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use Supabase's built-in resend verification email method
      const { error } = await supabase.auth.resend({
        email,
        type: 'signup'
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error resending verification:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password, rememberMe = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Keep the user logged in based on rememberMe parameter
          persistSession: rememberMe
        }
      });

      if (error) throw error;
      
      if (data && data.user) {
        setUser(data.user);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the scope parameter to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      
      // Clear any local storage items that might contain user data
      try {
        localStorage.removeItem('userInfo');
        // Clear any other user-related data from localStorage if needed
      } catch (err) {
        console.error('Error clearing localStorage:', err);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    sessionChecked,
    signUp,
    signIn,
    signOut,
    resetPassword,
    verifyOtp,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 