// pages/admin/vehicles.js
import useSWR from 'swr';
import api    from '../../src/api';
import { useState } from 'react';

export default function VehiclesPage() {
  const { data: users }    = useSWR('/users', () => api.get('/users').then(r => r.data));
  const { data: vehicles, mutate } = useSWR(
    '/vehicles',
    () => api.get('/vehicles').then(r => r.data)
  );

  const [form, setForm] = useState({
    plate:   '',
    model:   '',
    ownerId: ''
  });

  const createVehicle = async e => {
    e.preventDefault();
    try {
      // só envia ownerId se não for string vazia
      const payload = {
        plate: form.plate,
        model: form.model,
        ...(form.ownerId ? { ownerId: form.ownerId } : {})
      };
      const res = await api.post('/vehicles', payload);
      // limpa o form
      setForm({ plate: '', model: '', ownerId: '' });
      // refaz a lista
      mutate();
      alert(`Veículo ${res.data.plate} criado com sucesso!`);
    } catch (err) {
      console.error('Erro ao criar veículo:', err);
      alert(
        err.response?.data?.message ||
        err.message ||
        'Erro desconhecido ao criar veículo'
      );
    }
  };

  const deleteVehicle = async id => {
    if (!confirm('Eliminar veículo?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      mutate();
    } catch (err) {
      console.error('Erro ao eliminar veículo:', err);
      alert(err.response?.data?.message || err.message);
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
            <button onClick={() => deleteVehicle(v._id)}>Eliminar</button>
          </li>
        ))}
      </ul>

      <h3>Cadastrar Veículo</h3>
      <form onSubmit={createVehicle}>
        <input
          placeholder="plate"
          value={form.plate}
          onChange={e => setForm({ ...form, plate: e.target.value })}
          required
        /><br/>

        <input
          placeholder="model"
          value={form.model}
          onChange={e => setForm({ ...form, model: e.target.value })}
        /><br/>

        <select
          value={form.ownerId}
          onChange={e => setForm({ ...form, ownerId: e.target.value })}
        >
          <option value="">-- sem proprietário --</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>
              {u.username}
            </option>
          ))}
        </select><br/>

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
            }
