import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from '../api';

export default function VehicleControls({ vehicleId }) {
  const [status, setStatus] = useState('unknown');

  useEffect(() => {
    api.get(`/vehicles/${vehicleId}/status`)
      .then(r => setStatus(r.data.status))
      .catch(() => setStatus('unknown'));

    const socket = io(process.env.REACT_APP_API);
    socket.emit('joinVehicle', vehicleId);
    socket.on('geofenceViolation', () => setStatus('violated'));
    socket.on('engineStatus', ({ status }) => setStatus(status));
    return () => socket.disconnect();
  }, [vehicleId]);

  const toggle = () => {
    const cmd = status==='enabled' ? 'engine-kill' : 'engine-enable';
    api.post(`/vehicles/${vehicleId}/${cmd}`);
  };

  const labels = {
    enabled:  ['Cortar Bomba','Motor Ligado'],
    disabled: ['Habilitar Bomba','Motor Desligado'],
    violated: ['—','Geofence Violado']
  }[status]||['—','Desconhecido'];

  return (
    <div style={{ margin:'1rem 0' }}>
      <button onClick={toggle} disabled={status==='violated'}>
        {labels[0]}
      </button>
      <p><strong>Status:</strong> {labels[1]}</p>
    </div>
);
}
