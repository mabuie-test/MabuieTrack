import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Admin Dashboard</h1>
      <nav>
        <Link href="/admin/users"><a>Gestão de Utilizadores</a></Link> |{' '}
        <Link href="/admin/vehicles"><a>Gestão de Veículos</a></Link> |{' '}
        <button onClick={logout}>Sair</button>
      </nav>
    </div>
  );
}
