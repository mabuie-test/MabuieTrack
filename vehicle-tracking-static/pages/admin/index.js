import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { logout } = useAuth();
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      <nav className="space-x-4">
        <Link href="/admin/users"><a className="text-blue-500">Utilizadores</a></Link>
        <Link href="/admin/vehicles"><a className="text-blue-500">Veículos</a></Link>
        <button onClick={logout} className="ml-4 text-red-500">Sair</button>
      </nav>
    </div>
  );
}
