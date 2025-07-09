import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Router from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Ao montar, carrega do localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('auth'));
    if (stored?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${stored.token}`;
      setUser({ role: stored.role });
    }
  }, []);

  async function login(email, password) {
    const { data } = await axios.post('/api/auth/login', { email, password });
    // data.token, data.role
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    localStorage.setItem('auth', JSON.stringify({ token: data.token, role: data.role }));
    setUser({ role: data.role });
    Router.push('/');
  }

  function logout() {
    localStorage.removeItem('auth');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    Router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
