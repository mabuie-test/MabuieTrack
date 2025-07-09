import useSWR from 'swr';
import axios from 'axios';
import { useState } from 'react';

export default function VehiclesPage() {
  const { data: users }    = useSWR('/api/users', () => axios.get('/api/users').then(r=>r.data));
  const { data: vehicles, mutate } = useSWR('/api/vehicles', () => axios.get('/api/vehicles').then(r=>r.data));
  const [form, setForm] = useState({ plate:'', model:'', ownerId:'' });

  const createVehicle = async e => {
    e.preventDefault();
    await axios.post('/api/vehicles', form);
    setForm({ plate:'', model:'', ownerId:'' });
    mutate();
  };

  const deleteV = async id => {
    if (confirm('Eliminar veículo?')) {
      await axios.delete(`/api/vehicles/${id}`);
      mutate();
    }
  };

  if (!users || !vehicles) return <p className="p-4">Carregando…</p>;
  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Veículos</h2>
      <ul className="mb-4">
        {vehicles.map(v => (
          <li key={v._id} className="flex justify-between">
            {v.plate} — {v.model} — owner: {v.owner?.username||'nenhum'}
            <button onClick={()=>deleteV(v._id)} className="text-red-500">Eliminar</button>
          </li>
        ))}
      </ul>
      <h3 className="text-lg mb-2">Cadastrar Veículo</h3>
      <form onSubmit={createVehicle} className="space-y-2">
        <input
          placeholder="plate"
          className="w-full p-2 border rounded"
          value={form.plate}
          onChange={e=>setForm({...form,plate:e.target.value})}
        />
        <input
          placeholder="model"
          className="w-full p-2 border rounded"
          value={form.model}
          onChange={e=>setForm({...form,model:e.target.value})}
        />
        <select
          className="w-full p-2 border rounded"
          value={form.ownerId}
          onChange={e=>setForm({...form,ownerId:e.target.value})}
        >
          <option value="">-- sem proprietário --</option>
          {users.map(u=>(
            <option key={u._id} value={u._id}>{u.username}</option>
          ))}
        </select>
        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded">
          Cadastrar
        </button>
      </form>
    </div>
  );
}
