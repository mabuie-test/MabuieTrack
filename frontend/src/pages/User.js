import React, { useContext } from 'react';
import useSWR from 'swr';
import api    from '../api';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function UserPage() {
  const { logout } = useContext(AuthContext);
  const { data: vehicles } = useSWR(
    '/vehicles', () => api.get('/vehicles').then(r=>r.data)
  );

  if (!vehicles) return <p>Carregando…</p>;
  return (
    <div style={{ padding:'1rem' }}>
      <h1>Meus Veículos</h1>
      <button onClick={logout}>Sair</button>
      <ul>{vehicles.map(v=>(
        <li key={v._id}>
          {v.plate} — <Link to={`/map/${v._id}`}>Mapa</Link>
        </li>
      ))}</ul>
    </div>
  );
}
