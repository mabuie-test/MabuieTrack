import useSWR from 'swr';
import api from '../../src/api';
import { useState } from 'react';

export default function UsersPage() {
  const { data: users, mutate } = useSWR('/users', () => api.get('/users').then(r=>r.data));
  const [form, setForm] = useState({ username:'', email:'', password:'', role:'user' });

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

  if (!users) return <p className="p-4">Carregando…</p>;
  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Utilizadores</h2>
      <ul className="list-disc ml-6">
        {users.map(u=>(
          <li key={u._id}>
            {u.username} ({u.role})
            <button
              onClick={()=>deleteUser(u._id)}
              className="ml-4 text-red-600"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      <h3 className="mt-6">Criar Utilizador</h3>
      <form onSubmit={createUser} className="space-y-2 mt-2">
        <input
          placeholder="username"
          value={form.username}
          onChange={e=>setForm({...form,username:e.target.value})}
          className="w-full p-2 border rounded"
        />
        <input
          placeholder="email"
          value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="password"
          value={form.password}
          onChange={e=>setForm({...form,password:e.target.value})}
          className="w-full p-2 border rounded"
        />
        <select
          value={form.role}
          onChange={e=>setForm({...form,role:e.target.value})}
          className="w-full p-2 border rounded"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Criar
        </button>
      </form>
    </div>
  );
}
