import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      <nav className="space-x-4">
        <Link href="/admin/users"><a className="text-blue-600">Utilizadores</a></Link>
        <Link href="/admin/vehicles"><a className="text-blue-600">Veículos</a></Link>
        <button onClick={logout} className="ml-4 text-red-600">Sair</button>
      </nav>
    </div>
  );
}
