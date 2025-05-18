'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

// Helper function to generate a username from email
const generateUsernameFromEmail = (email) => {
  if (!email) return null;
  // Extract the part before the @ symbol and remove any non-alphanumeric characters
  return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Function to update user profile with a proper username
  const updateUserProfile = async (userId, email) => {
    try {
      // First check if this user already has a profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', fetchError);
        return;
      }
      
      // If the profile exists and has a proper username (not the auto-generated one), don't update it
      if (existingProfile && existingProfile.username && !existingProfile.username.startsWith('user_')) {
        return;
      }
      
      // Generate username from email
      const username = generateUsernameFromEmail(email);
      if (!username) return;
      
      // Update the user metadata
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: { username }
      });
      
      if (updateAuthError) {
        console.error('Error updating auth user data:', updateAuthError);
      }
      
      // Update or insert the profile
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
      if (upsertError) {
        console.error('Error updating profile:', upsertError);
      }
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
    }
  };

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
          
          // Check if this is a Google user who needs a username update
          if (session.user.app_metadata?.provider === 'google' || 
              session.user.identities?.some(identity => identity.provider === 'google')) {
            await updateUserProfile(session.user.id, session.user.email);
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
          
          // Check if this is a Google sign-in and update the profile if needed
          if (session.user.app_metadata?.provider === 'google' ||
              session.user.identities?.some(identity => identity.provider === 'google')) {
            await updateUserProfile(session.user.id, session.user.email);
          }
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

  // Sign in with Google
  const signInWithGoogle = async (redirectTo = '/exchange') => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current URL origin for the redirectTo
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}${redirectTo}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error signing in with Google:', error);
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
    signInWithGoogle,
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