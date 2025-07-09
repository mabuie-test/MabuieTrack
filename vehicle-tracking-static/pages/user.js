import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function UserPage() {
  const { logout } = useAuth();
  const { data: vehicles } = useSWR('/api/vehicles', () => axios.get('/api/vehicles').then(r=>r.data));

  if (!vehicles) return <p className="p-4">Carregando…</p>;
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Meus Veículos</h1>
      <button onClick={logout} className="mb-4 text-red-500">Sair</button>
      <ul>
        {vehicles.map(v=>(
          <li key={v._id}>
            {v.plate} — <Link href={`/map/${v._id}`}><a className="text-blue-500">Mapa</a></Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
