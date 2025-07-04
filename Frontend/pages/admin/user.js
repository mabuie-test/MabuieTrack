import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import useSWR from 'swr';
import api from '../api';

export default function UserDashboard() {
  const { logout } = useContext(AuthContext);
  const { data: vehicles } = useSWR('/vehicles', () => api.get('/vehicles').then(r=>r.data));

  if (!vehicles) return <p>Carregando…</p>;
  return (
    <div style={{ padding:'1rem' }}>
      <h1>Meus Veículos</h1>
      <button onClick={logout}>Sair</button>
      <ul>
        {vehicles.map(v=>(
          <li key={v._id}>
            {v.plate} — <Link href={`/map/${v._id}`}><a>Mapa</a></Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
