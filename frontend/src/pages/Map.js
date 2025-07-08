// src/pages/Map.js
import React, { useState, useEffect, useContext, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext }     from '../contexts/AuthContext';
import VehicleControls     from '../components/VehicleControls';
import api                 from '../api';

// Lazy‑load dos componentes com Leaflet
const VehicleMap     = lazy(() => import('../components/VehicleMap'));
const GeofenceEditor = lazy(() => import('../components/GeofenceEditor'));

export default function MapPage() {
  const { id: vehicleId } = useParams();
  const { user }          = useContext(AuthContext);

  const [initialGeo, setInitialGeo] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [errorGeo, setErrorGeo]     = useState(null);

  useEffect(() => {
    api.get(`/vehicles/${vehicleId}`)
      .then(r => setInitialGeo(r.data.geofence || null))
      .catch(e => setErrorGeo(e.response?.data?.message || e.message))
      .finally(() => setLoadingGeo(false));
  }, [vehicleId]);

  if (loadingGeo) return <p>Carregando área de circulação…</p>;
  if (errorGeo)   return <p style={{ color:'red' }}>Erro: {errorGeo}</p>;

  return (
    <div style={{ padding:'1rem' }}>
      <h1>Rastreamento Diário</h1>

      <Suspense fallback={<p>Carregando mapa…</p>}>
        <VehicleMap vehicleId={vehicleId} />
      </Suspense>

      <VehicleControls vehicleId={vehicleId} />

      {/* Debug: mostrar papel */}
      <p>Role atual: <strong>{user?.role}</strong></p>

      {user?.role === 'admin' && (
        <>
          <h2>Definir Área de Circulação</h2>
          <Suspense fallback={<p>Carregando editor de geofence…</p>}>
            <GeofenceEditor vehicleId={vehicleId} initialGeo={initialGeo} />
          </Suspense>
        </>
      )}

      <p><Link to="/">Voltar</Link></p>
    </div>
  );
}
