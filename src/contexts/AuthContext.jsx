import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authApi, tokenStore, userStore } from '../services/auth';

/**
 * Auth state for the whole app.
 *
 *   const { user, isAdmin, login, logout, loading } = useAuth();
 *
 * On mount we hydrate from localStorage (sync), then optionally re-validate
 * by calling /me (async). If /me 401s, the api interceptor fires
 * `auth:unauthorized`, which we catch here to clear state.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => userStore.get());
  const [bootstrapping, setBootstrapping] = useState(Boolean(tokenStore.get()));

  const clearSession = useCallback(() => {
    tokenStore.clear();
    userStore.clear();
    setUser(null);
  }, []);

  // Re-validate stored token on first mount.
  useEffect(() => {
    let cancelled = false;
    if (!tokenStore.get()) {
      setBootstrapping(false);
      return undefined;
    }
    (async () => {
      try {
        const res = await authApi.me();
        if (cancelled) return;
        if (res?.success && res.data) {
          userStore.set(res.data);
          setUser(res.data);
        }
      } catch {
        // 401 handled by the interceptor → unauthorized event below.
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Listen for 401s from anywhere.
  useEffect(() => {
    const onUnauthorized = () => {
      if (tokenStore.get()) toast.error('Session expired. Please log in again.');
      clearSession();
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    if (!res?.success) throw new Error(res?.message || 'Login failed');
    tokenStore.set(res.data.token);
    userStore.set(res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    toast.success('Logged out');
  }, [clearSession]);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    bootstrapping,
    login,
    logout,
    refreshUser: async () => {
      const res = await authApi.me();
      if (res?.success && res.data) {
        userStore.set(res.data);
        setUser(res.data);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
