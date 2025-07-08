// pages/map/[id].js
import { useState, useEffect, useContext } from 'react';
import { useRouter }                        from 'next/router';
import dynamic                              from 'next/dynamic';
import { AuthContext }                      from '../../src/contexts/AuthContext';
import VehicleControls                      from '../../src/components/VehicleControls';
import api                                  from '../../src/api';

// Dynamic imports (client‑only)
const VehicleMap     = dynamic(() => import('../../src/components/VehicleMap'),   { ssr: false });
const GeofenceEditor = dynamic(() => import('../../src/components/GeofenceEditor'), { ssr: false });

export default function MapPage() {
  const { query }     = useRouter();
  const vehicleId     = query.id;
  const { token, user } = useContext(AuthContext);

  const [initialGeo, setInitialGeo] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [errorGeo, setErrorGeo]     = useState(null);

  useEffect(() => {
    if (!vehicleId || !token) return;

    setLoadingGeo(true);
    api.get(`/vehicles/${vehicleId}`)
      .then(({ data: vehicle }) => {
        setInitialGeo(vehicle.geofence || null);
        setLoadingGeo(false);
      })
      .catch(err => {
        console.error('Erro ao buscar veículo:', err);
        setErrorGeo(err.response?.data?.message || err.message);
        setLoadingGeo(false);
      });
  }, [vehicleId, token]);

  if (!vehicleId)       return <p>Carregando…</p>;
  if (loadingGeo)       return <p>Carregando área de circulação…</p>;
  if (errorGeo)         return <p style={{ color: 'red' }}>Erro: {errorGeo}</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Rastreamento Diário</h1>

      <VehicleMap vehicleId={vehicleId} />

      <VehicleControls vehicleId={vehicleId} />

      {user?.role === 'admin' && (
        <>
          <h2>Definir Área de Circulação</h2>
          <GeofenceEditor
            vehicleId={vehicleId}
            initialGeo={initialGeo}
          />
        </>
      )}
    </div>
  );
}
