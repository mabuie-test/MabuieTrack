import React, { createContext, useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('auth'));
    if (stored?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${stored.token}`;
      setUser(stored.user);
    }
  }, []);

  async function login(email, pw) {
    const { data } = await api.post('/auth/login', { email, password: pw });
    const { token, user } = data;
    localStorage.setItem('auth', JSON.stringify({ token, user }));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    nav('/');
  }

  function logout() {
    localStorage.removeItem('auth');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    nav('/login');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
