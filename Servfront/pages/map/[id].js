// pages/map/[id].js
import { useState, useEffect, useContext } from 'react';
import { useRouter }                        from 'next/router';
import dynamic                              from 'next/dynamic';
import { AuthContext }                      from '../../src/contexts/AuthContext';
import VehicleControls                      from '../../src/components/VehicleControls';
import api                                  from '../../src/api';

// Importamos só no cliente (evita “window is not defined” no SSR)
const VehicleMap     = dynamic(() => import('../../src/components/VehicleMap'),    { ssr: false });
const GeofenceEditor = dynamic(() => import('../../src/components/GeofenceEditor'),  { ssr: false });
const VideoStream    = dynamic(() => import('../../src/components/VideoStream'),     { ssr: false });

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
        setInitialGeo(vehicle.geofence || null);
      })
      .catch(err => {
        console.error('Erro ao buscar geofence:', err);
        setErrorGeo(err.response?.data?.message || err.message);
      })
      .finally(() => {
        setLoadingGeo(false);
      });
  }, [vehicleId]);

  if (!vehicleId) return <p>Carregando…</p>;
  if (loadingGeo) return <p>Carregando área de circulação…</p>;
  if (errorGeo)   return <p style={{ color: 'red' }}>Erro: {errorGeo}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Rastreamento Diário</h1>

      {/* Mapa com telemetria e geofence */}
      <VehicleMap vehicleId={vehicleId} />

      {/* Botões de corte/habilitação de bomba */}
      <VehicleControls vehicleId={vehicleId} />

      {/* Stream de vídeo HLS em tempo real */}
      <VideoStream vehicleId={vehicleId} />

      {/* Só o admin vê o editor de geofence */}
      {user?.role === 'admin' && (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">Definir Área de Circulação</h2>
          <GeofenceEditor vehicleId={vehicleId} initialGeo={initialGeo} />
        </>
      )}
    </div>
  );
}
