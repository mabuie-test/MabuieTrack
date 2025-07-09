import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from '../api';

export default function VehicleControls({ vehicleId }) {
  const [status, setStatus] = useState('unknown');

  useEffect(() => {
    api.get(`/vehicles/${vehicleId}/status`)
       .then(r=>setStatus(r.data.status))
       .catch(()=>setStatus('unknown'));
    const socket = io(process.env.NEXT_PUBLIC_API);
    socket.emit('joinVehicle', vehicleId);
    socket.on('geofenceViolation', ()=> setStatus('violated'));
    socket.on('engineStatus', ({ status:st })=> setStatus(st));
    return ()=> socket.disconnect();
  }, [vehicleId]);

  const toggle = async () => {
    if (status==='enabled') {
      await api.post(`/vehicles/${vehicleId}/engine-kill`);
    } else {
      await api.post(`/vehicles/${vehicleId}/engine-enable`);
    }
  };

  const labels = {
    enabled:  ['Cortar Bomba','Motor Ligado'],
    disabled: ['Habilitar Bomba','Motor Desligado'],
    violated:['—','Geofence Violado']
  }[status] || ['—','Desconhecido'];

  return (
    <div className="mb-4">
      <button
        onClick={toggle}
        disabled={status==='violated'}
        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
      >
        {labels[0]}
      </button>
      <p className="mt-2"><strong>Status:</strong> {labels[1]}</p>
    </div>
  );
}
