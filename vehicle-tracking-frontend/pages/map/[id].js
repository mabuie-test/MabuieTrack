import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { AuthContext } from '../../src/contexts/AuthContext';
import VehicleControls from '../../src/components/VehicleControls';
import api from '../../src/api';

const VehicleMap     = dynamic(() => import('../../src/components/VehicleMap'),   { ssr: false });
const GeofenceEditor = dynamic(() => import('../../src/components/GeofenceEditor'), { ssr: false });

export default function MapPage() {
  const { query }   = useRouter();
  const vehicleId   = query.id;
  const { user }    = useContext(AuthContext);

  const [initialGeo, setInitialGeo] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [errorGeo, setErrorGeo]     = useState(null);

  useEffect(() => {
    if (!vehicleId) return;
    api.get(`/vehicles/${vehicleId}`)
      .then(r => setInitialGeo(r.data.geofence || null))
      .catch(e => setErrorGeo(e.response?.data?.message || e.message))
      .finally(()=>setLoadingGeo(false));
  }, [vehicleId]);

  if (!vehicleId) return <p className="p-4">Carregando…</p>;
  if (loadingGeo) return <p className="p-4">Carregando área de circulação…</p>;
  if (errorGeo)   return <p className="p-4 text-red-600">Erro: {errorGeo}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Rastreamento Diário</h1>
      <VehicleMap vehicleId={vehicleId} />
      <VehicleControls vehicleId={vehicleId} />

      {user?.role === 'admin' && (
        <>
          <h2 className="mt-6 mb-2 text-xl">Definir Área de Circulação</h2>
          <GeofenceEditor vehicleId={vehicleId} initialGeo={initialGeo} />
        </>
      )}
    </div>
  );
}
