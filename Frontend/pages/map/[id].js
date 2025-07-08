import { useState, useEffect, useContext } from 'react';
import { useRouter }                      from 'next/router';
import dynamic                            from 'next/dynamic';
import { AuthContext }                    from '../../src/contexts/AuthContext';
import VehicleControls                    from '../../src/components/VehicleControls';
import api                                from '../../src/api';

const VehicleMap     = dynamic(() => import('../../src/components/VehicleMap'),   { ssr: false });
const GeofenceEditor = dynamic(() => import('../../src/components/GeofenceEditor'), { ssr: false });

export default function MapPage() {
  const { query } = useRouter();
  const vehicleId  = query.id;
  const { user }   = useContext(AuthContext);

  const [initialGeo, setInitialGeo] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [errorGeo, setErrorGeo]     = useState(null);

  useEffect(() => {
    if (!vehicleId) return;
    setLoadingGeo(true);
    setErrorGeo(null);

    api.get(`/vehicles/${vehicleId}`)
      .then(({ data: vehicle }) => {
        console.log('Vehicle fetched:', vehicle);
        setInitialGeo(vehicle.geofence || null);
      })
      .catch(err => {
        console.error('Erro ao buscar geofence:', err);
        setErrorGeo(err.response?.data?.message || err.message);
      })
      .finally(() => setLoadingGeo(false));
  }, [vehicleId]);

  if (!vehicleId)   return <p>Carregando…</p>;
  if (loadingGeo)   return <p>Carregando área de circulação…</p>;
  if (errorGeo)     return <p style={{ color: 'red' }}>Erro: {errorGeo}</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Rastreamento Diário</h1>

      <VehicleMap vehicleId={vehicleId} />

      <VehicleControls vehicleId={vehicleId} />

      {/* Para debug: revele o papel do utilizador */}
      <p>Role atual: <strong>{user?.role}</strong></p>

      {user?.role === 'admin' && (
        <>
          <h2>Definir Área de Circulação</h2>
          <GeofenceEditor vehicleId={vehicleId} initialGeo={initialGeo} />
        </>
      )}
    </div>
  );
}
