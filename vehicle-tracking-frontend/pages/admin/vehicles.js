import useSWR from 'swr';
import api from '../../src/api';
import { useState } from 'react';

export default function VehiclesPage() {
  const { data: users }    = useSWR('/users', () => api.get('/users').then(r=>r.data));
  const { data: vehicles, mutate } = useSWR('/vehicles', () => api.get('/vehicles').then(r=>r.data));
  const [form, setForm] = useState({ plate:'', model:'', ownerId:'' });

  const createVehicle = async e => {
    e.preventDefault();
    await api.post('/vehicles', form);
    setForm({ plate:'', model:'', ownerId:'' });
    mutate();
  };
  const deleteVehicle = async id => {
    if (confirm('Eliminar veículo?')) {
      await api.delete(`/vehicles/${id}`);
      mutate();
    }
  };

  if (!users || !vehicles) return <p className="p-4">Carregando…</p>;
  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Veículos</h2>
      <ul className="list-disc ml-6">
        {vehicles.map(v=>(
          <li key={v._id}>
            {v.plate} — {v.model} — owner: {v.owner?.username||'nenhum'}
            <button
              onClick={()=>deleteVehicle(v._id)}
              className="ml-4 text-red-600"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <h3 className="mt-6">Cadastrar Veículo</h3>
      <form onSubmit={createVehicle} className="space-y-2 mt-2">
        <input
          placeholder="plate"
          value={form.plate}
          onChange={e=>setForm({...form,plate:e.target.value})}
          className="w-full p-2 border rounded"
        />
        <input
          placeholder="model"
          value={form.model}
          onChange={e=>setForm({...form,model:e.target.value})}
          className="w-full p-2 border rounded"
        />
        <select
          value={form.ownerId}
          onChange={e=>setForm({...form,ownerId:e.target.value})}
          className="w-full p-2 border rounded"
        >
          <option value="">-- sem proprietário --</option>
          {users.map(u=>(
            <option key={u._id} value={u._id}>{u.username}</option>
          ))}
        </select>
        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Cadastrar
        </button>
      </form>
    </div>
  );
}
