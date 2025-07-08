// pages/index.js
import { useContext, useEffect } from 'react';
import { AuthContext } from '../src/contexts/AuthContext';
import AdminDashboard from './admin';
import UserDashboard  from './user';

export default function Home() {
  const { user } = useContext(AuthContext);

  // Redireciona ao login se não estiver autenticado
  useEffect(() => {
    if (!user) window.location.href = '/login';
  }, [user]);

  if (!user) return <p>Carregando…</p>;
  return user.role === 'admin'
    ? <AdminDashboard />
    : <UserDashboard />;
}
