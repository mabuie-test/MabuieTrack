import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './admin';
import UserDashboard  from './user';

export default function Home() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Se não autenticado, vai ao login
      window.location.href = '/login';
    }
  }, [user]);

  if (!user) return <p className="p-4">Carregando…</p>;
  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
}
