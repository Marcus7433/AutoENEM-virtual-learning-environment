import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { API } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshRef = useRef(() => {});

  useEffect(() => {
    const refresh = () => {
      setLoading(true);
      fetch(`${API}/api/auth/me`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setUser(data?.user ?? null))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    };

    refreshRef.current = refresh;
    refresh();

    const onMessage = ({ origin, data }) => {
      if (origin !== window.location.origin) return;
      if (data?.type === 'AUTH_SUCCESS') refresh();
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const refreshUser = useCallback(() => refreshRef.current(), []);
  const value = useMemo(() => ({ user, loading, refreshUser }), [user, loading, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
