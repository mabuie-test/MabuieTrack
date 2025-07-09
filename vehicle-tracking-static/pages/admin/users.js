import useSWR from 'swr';
import axios from 'axios';
import { useState } from 'react';

export default function UsersPage() {
  const { data: users, mutate } = useSWR('/api/users', () => axios.get('/api/users').then(r => r.data));
  const [form, setForm] = useState({ username:'', email:'', password:'', role:'user' });

  const createUser = async e => {
    e.preventDefault();
    await axios.post('/api/auth/register', form);
    setForm({ username:'', email:'', password:'', role:'user' });
    mutate();
  };

  const deleteUser = async id => {
    if (confirm('Eliminar utilizador?')) {
      await axios.delete(`/api/users/${id}`);
      mutate();
    }
  };

  if (!users) return <p className="p-4">Carregando…</p>;
  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Utilizadores</h2>
      <ul className="mb-4">
        {users.map(u => (
          <li key={u._id} className="flex justify-between">
            {u.username} ({u.role})
            <button onClick={() => deleteUser(u._id)} className="text-red-500">Eliminar</button>
          </li>
        ))}
      </ul>
      <h3 className="text-lg mb-2">Criar Utilizador</h3>
      <form onSubmit={createUser} className="space-y-2">
        <input
          placeholder="username"
          className="w-full p-2 border rounded"
          value={form.username}
          onChange={e=>setForm({...form,username:e.target.value})}
        />
        <input
          placeholder="email"
          className="w-full p-2 border rounded"
          value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})}
        />
        <input
          type="password"
          placeholder="password"
          className="w-full p-2 border rounded"
          value={form.password}
          onChange={e=>setForm({...form,password:e.target.value})}
        />
        <select
          className="w-full p-2 border rounded"
          value={form.role}
          onChange={e=>setForm({...form,role:e.target.value})}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded">
          Criar
        </button>
      </form>
    </div>
  );
}
