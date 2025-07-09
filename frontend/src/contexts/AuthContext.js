import React, { createContext, useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const st = JSON.parse(localStorage.getItem('auth'));
    if (st?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${st.token}`;
      setUser(st.user);
    }
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    const token = data.token;
    // decodifica o payload para obter role
    const [, payload] = token.split('.');
    const { sub: id, role } = JSON.parse(atob(payload));
    const user = { id, role };
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
