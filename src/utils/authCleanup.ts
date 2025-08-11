
export const cleanupAuthState = () => {
  try {
    if (typeof window === 'undefined') return;

    console.log('Cleaning up auth state...');

    // Remove standard supabase auth token (legacy key)
    localStorage.removeItem('supabase.auth.token');

    // Remove all Supabase-related keys in localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || 
          key.includes('sb-') || 
          key.startsWith('sb.') ||
          key.includes('supabase') ||
          key.includes('auth.token')) {
        console.log('Removing localStorage key:', key);
        localStorage.removeItem(key);
      }
    });

    // Remove all Supabase-related keys in sessionStorage (if any)
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || 
            key.includes('sb-') || 
            key.startsWith('sb.') ||
            key.includes('supabase') ||
            key.includes('auth.token')) {
          console.log('Removing sessionStorage key:', key);
          sessionStorage.removeItem(key);
        }
      });
    }

    console.log('Auth state cleanup completed');
  } catch (e) {
    // Non-fatal; continue even if cleanup fails
    console.warn('Auth cleanup warning:', e);
  }
};

export const forceRefreshPage = () => {
  try {
    if (typeof window !== 'undefined') {
      // Force a complete page refresh to ensure clean state
      window.location.href = window.location.pathname;
    }
  } catch (e) {
    console.warn('Page refresh warning:', e);
  }
};
