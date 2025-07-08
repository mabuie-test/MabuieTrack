// pages/admin/index.js
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  return (
    <div style={{ padding:'1rem' }}>
      <h1>Admin Dashboard</h1>
      <nav>
        <Link href="/admin/users">Utilizadores</Link> |{' '}
        <Link href="/admin/vehicles">Veículos</Link> |{' '}
        <button onClick={logout}>Sair</button>
      </nav>
    </div>
  );
}
// Força SSR nesta rota dinâmica
export async function getServerSideProps() {
  return { props: {} };
}
