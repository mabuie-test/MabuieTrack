import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import UserDashboard from './user';
import AdminDashboard from './admin';

export default function Home() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) window.location.href = '/login';
  }, [user]);

  if (!user) return <p>Carregando…</p>;
  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
}
