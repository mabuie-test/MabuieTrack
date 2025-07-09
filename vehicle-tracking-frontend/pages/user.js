import useSWR from 'swr';
import api from '../src/api';
import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '../src/contexts/AuthContext';

export default function UserPage() {
  const { logout } = useContext(AuthContext);
  const { data: vehicles } = useSWR('/vehicles', () => api.get('/vehicles').then(r=>r.data));

  if (!vehicles) return <p className="p-4">Carregando…</p>;
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Meus Veículos</h1>
      <button onClick={logout} className="mb-4 text-red-600">Sair</button>
      <ul className="list-disc ml-6">
        {vehicles.map(v=>(
          <li key={v._id}>
            {v.plate} — <Link href={`/map/${v._id}`}><a className="text-blue-600">Mapa</a></Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
