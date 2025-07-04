import useSWR from 'swr';
import api from '../../api';
import { useState } from 'react';

export default function VehicleManagement() {
  const { data: users }    = useSWR('/users', () => api.get('/users').then(r=>r.data));
  const { data: vehicles, mutate } = useSWR('/vehicles', () => api.get('/vehicles').then(r=>r.data));
  const [form, setForm] = useState({ plate:'', model:'', ownerId:'' });

  const handleCreate = async e => {
    e.preventDefault();
    await api.post('/vehicles', form);
    setForm({ plate:'', model:'', ownerId:'' });
    mutate();
  };

  const handleDelete = async id => {
    if(confirm('Eliminar veículo?')) {
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
            {v.plate} — {v.model} — owner: {v.owner?.username || 'nenhum'} —{' '}
            <button onClick={()=>handleDelete(v._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <h3>Registrar Veículo</h3>
      <form onSubmit={handleCreate}>
        <input placeholder="plate" value={form.plate}
          onChange={e=>setForm({...form,plate:e.target.value})} /><br/>
        <input placeholder="model" value={form.model}
          onChange={e=>setForm({...form,model:e.target.value})} /><br/>
        <select value={form.ownerId}
          onChange={e=>setForm({...form,ownerId:e.target.value})}>
          <option value="">-- sem owner --</option>
          {users.map(u=>(
            <option key={u._id} value={u._id}>{u.username}</option>
          ))}
        </select><br/>
        <button type="submit">Criar</button>
      </form>
    </div>
  );
}
