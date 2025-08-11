
export const cleanupAuthState = () => {
  try {
    if (typeof window === 'undefined') return;

    // Remove standard supabase auth token (legacy key)
    localStorage.removeItem('supabase.auth.token');

    // Remove all Supabase-related keys in localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    // Remove all Supabase-related keys in sessionStorage (if any)
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Non-fatal; continue even if cleanup fails
    console.warn('Auth cleanup warning:', e);
  }
};
