import { useContext, useEffect } from 'react';
import { AuthContext } from '../src/contexts/AuthContext';
import { useRouter }   from 'next/router';
import AdminDashboard  from './admin';
import UserDashboard   from './user';

export default function Home() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  // Se ainda estamos a carregar auth, exibimos “Carregando…”
  if (loading) {
    return <p>Carregando sessão…</p>;
  }

  // Depois de carregar, se não há user, vamos ao login
  if (!user) {
    router.replace('/login');
    return null;
  }

  // Finalmente, exibimos o dashboard certo
  return user.role === 'admin'
    ? <AdminDashboard />
    : <UserDashboard />;
}
