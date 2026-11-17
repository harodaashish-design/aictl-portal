import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

function getStoredAuth() {
  const token =
    localStorage.getItem('aicte_token') || sessionStorage.getItem('aicte_token');
  const rawUser =
    localStorage.getItem('aicte_user') || sessionStorage.getItem('aicte_user');
  if (!token || !rawUser) return { token: null, user: null };
  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const initial = getStoredAuth();
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);
  const [loading, setLoading] = useState(Boolean(initial.token));

  const persistAuth = useCallback((nextToken, nextUser, remember = true) => {
    localStorage.removeItem('aicte_token');
    localStorage.removeItem('aicte_user');
    sessionStorage.removeItem('aicte_token');
    sessionStorage.removeItem('aicte_user');

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('aicte_token', nextToken);
    storage.setItem('aicte_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const updateUserState = useCallback((updatedUser) => {
    setUser(updatedUser);
    if (localStorage.getItem('aicte_token')) {
      localStorage.setItem('aicte_user', JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem('aicte_token')) {
      sessionStorage.setItem('aicte_user', JSON.stringify(updatedUser));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aicte_token');
    localStorage.removeItem('aicte_user');
    sessionStorage.removeItem('aicte_token');
    sessionStorage.removeItem('aicte_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await authService.getMe();
      if (data.user) {
        updateUserState(data.user);
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, updateUserState, logout]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        persistAuth,
        updateUserState,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
