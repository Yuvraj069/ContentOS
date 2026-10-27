import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { handle, niche }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on reload
  useEffect(() => {
    const saved = localStorage.getItem('contentos:token');
    const savedUser = localStorage.getItem('contentos:user');
    if (saved && savedUser) {
      setToken(saved);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(handle, password) {
    const res = await api.post('/api/auth/login', { handle, password });
    const { token: t, handle: h, niche } = res.data;
    localStorage.setItem('contentos:token', t);
    localStorage.setItem('contentos:user', JSON.stringify({ handle: h, niche }));
    setToken(t);
    setUser({ handle: h, niche });
  }

  async function register(handle, password, niche, initialFollowers) {
    const res = await api.post('/api/auth/register', { handle, password, niche, initialFollowers });
    const { token: t, handle: h, niche: n } = res.data;
    localStorage.setItem('contentos:token', t);
    localStorage.setItem('contentos:user', JSON.stringify({ handle: h, niche: n }));
    setToken(t);
    setUser({ handle: h, niche: n });
  }

  function logout() {
    localStorage.removeItem('contentos:token');
    localStorage.removeItem('contentos:user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
