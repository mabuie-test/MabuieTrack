import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

export default function VehicleControls({ vehicleId }) {
  const [status, setStatus] = useState('unknown');

  // Inicial fetch e Socket.IO
  useEffect(() => {
    axios.get(`/api/vehicles/${vehicleId}/status`)
      .then(r=>setStatus(r.data.status))
      .catch(()=>setStatus('unknown'));

    const socket = io();
    socket.emit('joinVehicle', vehicleId);
    socket.on('engineStatus', ({ status:st }) => setStatus(st));

    return () => socket.disconnect();
  }, [vehicleId]);

  const toggle = async () => {
    if (status === 'enabled') {
      await axios.post(`/api/vehicles/${vehicleId}/engine-kill`);
      setStatus('disabled');
    } else {
      await axios.post(`/api/vehicles/${vehicleId}/engine-enable`);
      setStatus('enabled');
    }
  };

  const labels = {
    enabled:  ['Cortar Bomba','Motor Ligado'],
    disabled: ['Habilitar Bomba','Motor Desligado'],
    unknown: ['—','Desconhecido']
  }[status];

  return (
    <div className="my-4">
      <button
        onClick={toggle}
        disabled={status==='unknown'}
        className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
      >
        {labels[0]}
      </button>
      <p className="mt-2"><strong>Status:</strong> {labels[1]}</p>
    </div>
  );
}
