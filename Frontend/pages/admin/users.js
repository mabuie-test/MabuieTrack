// pages/admin/users.js
import useSWR from 'swr';
import api    from '../../src/api';
import { useState } from 'react';

export default function UsersPage() {
  const { data: users, mutate } = useSWR(
    '/users',
    () => api.get('/users').then(r => r.data)
  );
  const [form, setForm] = useState({
    username:'', email:'', password:'', role:'user'
  });

  const createUser = async e => {
    e.preventDefault();
    await api.post('/auth/register', form);
    setForm({ username:'', email:'', password:'', role:'user' });
    mutate();
  };

  const deleteUser = async id => {
    if (confirm('Eliminar utilizador?')) {
      await api.delete(`/users/${id}`);
      mutate();
    }
  };

  if (!users) return <p>Carregando…</p>;
  return (
    <div style={{ padding:'1rem' }}>
      <h2>Utilizadores</h2>
      <ul>
        {users.map(u => (
          <li key={u._id}>
            {u.username} ({u.role}){' '}
            <button onClick={() => deleteUser(u._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <h3>Criar Utilizador</h3>
      <form onSubmit={createUser}>
        <input
          placeholder="username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
        /><br/>
        <input
          placeholder="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        /><br/>
        <input
          type="password"
          placeholder="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        /><br/>
        <select
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select><br/>
        <button type="submit">Criar</button>
      </form>
    </div>
  );
}
