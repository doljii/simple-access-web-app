
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
    // Set up auth state listener first
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      
      if (session?.user) {
        // Defer profile fetching to avoid deadlocks
        setTimeout(async () => {
          const profile = await fetchOrCreateUserProfile(session.user);
          if (profile) {
            setUser({ ...session.user, ...profile });
          } else {
            // Fallback to user data from auth
            setUser({ 
              ...session.user, 
              username: session.user.email?.split('@')[0] || 'user',
              name: session.user.email || 'User',
              role: 'panjar' as const
            });
          }
        }, 0);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      if (session?.user) {
        const profile = await fetchOrCreateUserProfile(session.user);
        if (profile) {
          setUser({ ...session.user, ...profile });
        } else {
          // Fallback to user data from auth
          setUser({ 
            ...session.user, 
            username: session.user.email?.split('@')[0] || 'user',
            name: session.user.email || 'User',
            role: 'panjar' as const
          });
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) {
        console.log('Profile found:', data);
        return data;
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
        return null;
      }

      console.log('Profile created:', createdProfile);
      return createdProfile;
    } catch (err) {
      console.error('Profile fetch/create error:', err);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
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
      const redirectUrl = `${window.location.origin}/`;
      
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
      return { error: null };
    } catch (err) {
      console.error('Sign up catch error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
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
