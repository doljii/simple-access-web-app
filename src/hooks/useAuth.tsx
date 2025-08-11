
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState, forceRefreshPage } from '@/utils/authCleanup';

interface Profile {
  id: string;
  username: string;
  name: string;
  role: 'panjar' | 'karung' | 'admin';
}

interface AuthContextType {
  user: (User & Profile) | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    metadata: { username: string; name: string; role: 'panjar' | 'karung' | 'admin' }
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(User & Profile) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    // Set up auth state listener first (non-async to avoid deadlocks)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);

      if (session?.user) {
        console.log('User session detected, fetching profile...');
        // Defer profile fetching to avoid deadlocks
        setTimeout(async () => {
          try {
            const profile = await fetchOrCreateUserProfile(session.user);
            if (profile) {
              console.log('Profile loaded successfully:', profile);
              setUser({ ...session.user, ...profile });
            } else {
              console.log('Profile creation failed, using fallback data');
              // Fallback to user data from auth
              setUser({
                ...session.user,
                username: session.user.email?.split('@')[0] || 'user',
                name: session.user.user_metadata?.name || session.user.email || 'User',
                role: (session.user.user_metadata?.role as 'panjar' | 'karung' | 'admin') || 'panjar'
              });
            }
          } catch (error) {
            console.error('Error in profile fetching:', error);
            // Fallback to user data from auth
            setUser({
              ...session.user,
              username: session.user.email?.split('@')[0] || 'user',
              name: session.user.user_metadata?.name || session.user.email || 'User',
              role: (session.user.user_metadata?.role as 'panjar' | 'karung' | 'admin') || 'panjar'
            });
          }
        }, 100);
      } else {
        console.log('No user session');
        setUser(null);
      }
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }

      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      
      if (session?.user) {
        try {
          const profile = await fetchOrCreateUserProfile(session.user);
          if (profile) {
            setUser({ ...session.user, ...profile });
          } else {
            // Fallback to user data from auth
            setUser({
              ...session.user,
              username: session.user.email?.split('@')[0] || 'user',
              name: session.user.user_metadata?.name || session.user.email || 'User',
              role: (session.user.user_metadata?.role as 'panjar' | 'karung' | 'admin') || 'panjar'
            });
          }
        } catch (error) {
          console.error('Error in initial profile fetch:', error);
          // Fallback to user data from auth
          setUser({
            ...session.user,
            username: session.user.email?.split('@')[0] || 'user',
            name: session.user.user_metadata?.name || session.user.email || 'User',
            role: (session.user.user_metadata?.role as 'panjar' | 'karung' | 'admin') || 'panjar'
          });
        }
      }
      setLoading(false);
    });

    return () => {
      console.log('Auth provider cleanup');
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrCreateUserProfile = async (user: User): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', user.id);
      
      // First try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        console.log('Profile found:', data);
        return data as unknown as Profile;
      }

      // If no profile exists, create one
      console.log('No profile found, creating one for user:', user.id);
      const newProfile = {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        name: user.user_metadata?.name || user.email || 'User',
        role: (user.user_metadata?.role as 'panjar' | 'karung' | 'admin') || 'panjar'
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        // If it's a conflict error, try to fetch again (race condition)
        if (createError.code === '23505') {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          return existingProfile as unknown as Profile;
        }
        return null;
      }

      console.log('Profile created:', createdProfile);
      return createdProfile as unknown as Profile;
    } catch (err) {
      console.error('Profile fetch/create error:', err);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);

      // Clean up any stale tokens and ensure a clean state
      cleanupAuthState();
      
      // Attempt global sign out to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('Pre-login global sign out warning (ignored):', e);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful:', data.user?.email);
      return { error: null };
    } catch (err) {
      console.error('Sign in catch error:', err);
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { username: string; name: string; role: 'panjar' | 'karung' | 'admin' }
  ) => {
    try {
      console.log('Attempting sign up for:', email, 'with role:', metadata.role);

      // Clean up any stale tokens before starting a new sign up flow
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('Pre-signup global sign out warning (ignored):', e);
      }

      const redirectUrl = `${window.location.origin}/dashboard`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: metadata.username,
            name: metadata.name,
            role: metadata.role
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        return { error: signUpError };
      }

      console.log('Sign up successful:', data.user?.email);
      
      // If email confirmation is disabled, the user will be automatically signed in
      if (data.user && data.session) {
        console.log('User auto-signed in after registration');
      }
      
      return { error: null };
    } catch (err) {
      console.error('Sign up catch error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      
      // Clean local state first
      setUser(null);
      setSession(null);
      
      // Clean up auth state
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (e) {
        console.warn('Global sign out warning (ignored):', e);
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      // Force a full page reload to ensure a clean slate
      setTimeout(() => {
        forceRefreshPage();
      }, 100);
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
