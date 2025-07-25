import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from '../api';

export default function VehicleControls({ vehicleId }) {
  const [status, setStatus] = useState('enabled'); // assume motor ligado

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API);
    socket.emit('joinVehicle', vehicleId);

    socket.on('geofenceViolation', () => {
      setStatus('violated');
    });
    socket.on('engineStatus', ({ status: st }) => {
      setStatus(st);
    });

    return () => {
      socket.emit('leaveVehicle', vehicleId);
      socket.disconnect();
    };
  }, [vehicleId]);

  const toggle = async () => {
    if (status === 'enabled') {
      await api.post(`/vehicles/${vehicleId}/engine-kill`);
      setStatus('disabled');
    } else if (status === 'disabled') {
      await api.post(`/vehicles/${vehicleId}/engine-enable`);
      setStatus('enabled');
    }
  };

  const labels = {
    enabled:  ['Cortar Bomba',    'Motor Ligado'],
    disabled: ['Habilitar Bomba', 'Motor Desligado'],
    violated: ['—',               'Geofence Violado']
  }[status] || ['—', 'Desconhecido'];

  return (
    <div style={{ margin: '1rem 0' }}>
      <button onClick={toggle} disabled={status === 'violated'}>
        {labels[0]}
      </button>
      <p><strong>Status da Bomba:</strong> {labels[1]}</p>
    </div>
  );
}
