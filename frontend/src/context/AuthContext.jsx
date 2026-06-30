import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')));
  const [themePreference, setThemePreferenceState] = useState(localStorage.getItem('themePreference') || 'system');

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/users/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    function applyTheme() {
      const useDark = themePreference === 'dark' || (themePreference === 'system' && media.matches);
      document.documentElement.classList.toggle('dark', useDark);
      document.documentElement.dataset.theme = themePreference;
    }
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [themePreference]);

  async function login(payload) {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    if (data.user.theme_preference) setThemePreference(data.user.theme_preference, false);
    return data.user;
  }

  async function register(payload) {
    const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    if (data.user.theme_preference) setThemePreference(data.user.theme_preference, false);
    return data.user;
  }

  function updateUser(nextUser) {
    setUser(nextUser);
    if (nextUser?.theme_preference) setThemePreference(nextUser.theme_preference, false);
  }

  async function setThemePreference(value, persist = true) {
    localStorage.setItem('themePreference', value);
    setThemePreferenceState(value);
    if (persist && localStorage.getItem('token')) {
      try {
        const data = await api('/users/me/settings', { method: 'PUT', body: JSON.stringify({ themePreference: value }) });
        setUser(data.user);
      } catch (_error) {
        // Keep local theme responsive even if saving fails.
      }
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, updateUser, themePreference, setThemePreference }), [user, loading, themePreference]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
