import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('shoplite_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then((r) => setUser(r.data.data.user))
      .catch(() => localStorage.removeItem('shoplite_token'))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = (data) => {
    localStorage.setItem('shoplite_token', data.token);
    setUser(data.user);
  };
  const login = async (email, password) => handleAuth((await api.post('/auth/login', { email, password })).data.data);
  const register = async (form) => handleAuth((await api.post('/auth/register', form)).data.data);
  const logout = () => { localStorage.removeItem('shoplite_token'); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}
