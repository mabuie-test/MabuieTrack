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

  if (!users || !vehicles) return <p>Carregando…</p>;
  return (
    <div style={{ padding:'1rem' }}>
      <h2>Veículos</h2>
      <ul>
        {vehicles.map(v => (
          <li key={v._id}>
            {v.plate} — {v.model} — owner: {v.owner?.username || 'nenhum'}{' '}
            <button onClick={()=>deleteVehicle(v._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <h3>Cadastrar Veículo</h3>
      <form onSubmit={createVehicle}>
        <input placeholder="plate" value={form.plate}
          onChange={e=>setForm({...form,plate:e.target.value})} /><br/>
        <input placeholder="model" value={form.model}
          onChange={e=>setForm({...form,model:e.target.value})} /><br/>
        <select value={form.ownerId}
          onChange={e=>setForm({...form,ownerId:e.target.value})}>
          <option value="">-- sem proprietário --</option>
          {users.map(u=>(
            <option key={u._id} value={u._id}>{u.username}</option>
          ))}
        </select><br/>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
