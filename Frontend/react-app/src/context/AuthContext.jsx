import { createContext, useContext, useEffect, useState } from 'react';
import { CONFIG } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(!!localStorage.getItem('authToken'));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Invalid token');
        const data = await res.json();
        setUser(data.user || null);
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const loginWithToken = (nextToken, nextUser) => {
    localStorage.setItem('authToken', nextToken);
    if (nextUser) localStorage.setItem('userData', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser || null);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('currentCollectionId');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

