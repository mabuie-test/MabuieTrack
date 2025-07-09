import { createContext, useState, useEffect } from 'react';
import api from '../api';
import Router from 'next/router';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('auth'));
    if (stored?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${stored.token}`;
      setUser(stored);
    }
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login',{email,password});
    const [,payload] = data.token.split('.');
    const { role } = JSON.parse(atob(payload));
    const auth = { token:data.token, role };
    localStorage.setItem('auth', JSON.stringify(auth));
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(auth);
    Router.push('/');
  }

  function logout() {
    localStorage.removeItem('auth');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    Router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
