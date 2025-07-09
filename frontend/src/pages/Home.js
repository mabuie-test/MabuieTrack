import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  if (!user) return null;

  return (
    <div style={{ padding:'1rem' }}>
      <h1>Bem‑vindo, {user.role}</h1>
      <button onClick={logout}>Sair</button>
      {user.role === 'admin' ? (
        <>
          <p><Link to="/admin/users">Gestão Utilizadores</Link></p>
          <p><Link to="/admin/vehicles">Gestão Veículos</Link></p>
        </>
      ) : (
        <p><Link to="/user">Teus veículos</Link></p>
      )}
    </div>
  );
}
