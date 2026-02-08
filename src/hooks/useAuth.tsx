import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfileService, UserProfile } from '@/services/userProfileService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('AuthProvider: Starting to fetch user profile for:', userId);
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 15000); // Increased to 15 seconds
      });
      
      const profilePromise = UserProfileService.getUserProfile(userId);
      const profile = await Promise.race([profilePromise, timeoutPromise]) as UserProfile | null;
      
      console.log('AuthProvider: Profile fetch completed:', { hasProfile: !!profile, profileId: profile?.id });
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't set userProfile to null on timeout, keep existing profile
      if (error instanceof Error && error.message.includes('timeout')) {
        console.warn('Profile fetch timed out, keeping existing profile');
      } else {
        setUserProfile(null);
      }
    }
  };

  const refreshUserProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed', { event, session: !!session, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          console.log('AuthProvider: Fetching user profile for', session.user.id);
          
          // Check if this is a new user (Google OAuth signup)
          if (event === 'SIGNED_IN' && session.user.app_metadata?.provider === 'google') {
            try {
              // Try to get existing profile
              const { data: existingProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profileError && profileError.code === 'PGRST116') {
                // New user - create profile with customer role
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
                    last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                    user_type: 'customer',
                    avatar_url: session.user.user_metadata?.avatar_url || null,
                    account_setup_completed: false // Flag for account setup completion
                  });

                if (insertError) {
                  console.error('Error creating profile for Google OAuth user:', insertError);
                } else {
                  console.log('Profile created for Google OAuth user');
                }
              }
            } catch (error) {
              console.error('Error handling Google OAuth user profile:', error);
            }
          }
          
          await fetchUserProfile(session.user.id);
        } else {
          console.log('AuthProvider: No session, clearing user profile');
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    console.log('AuthProvider: Getting initial session');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthProvider: Initial session result', { hasSession: !!session, userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.id) {
        console.log('AuthProvider: Fetching initial user profile for', session.user.id);
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://myplug.co.ke/',
        data: userData
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://myplug.co.ke/reset-password'
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    userProfile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    refreshUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
