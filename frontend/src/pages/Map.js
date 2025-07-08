import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import dynamic             from 'react-dynamic-import'; 
import { AuthContext }     from '../contexts/AuthContext';
import VehicleControls     from '../components/VehicleControls';
import api from '../api';

const VehicleMap     = React.lazy(() => import('../components/VehicleMap'));
const GeofenceEditor = React.lazy(() => import('../components/GeofenceEditor'));

export default function MapPage() {
  const { id: vehicleId } = useParams();
  const { user } = useContext(AuthContext);

  const [initialGeo, setInitialGeo] = useState(null);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [errorGeo, setErrorGeo]     = useState(null);

  useEffect(() => {
    api.get(`/vehicles/${vehicleId}`)
      .then(r=>{ setInitialGeo(r.data.geofence || null); })
      .catch(e=>{ setErrorGeo(e.message); })
      .finally(()=>setLoadingGeo(false));
  }, [vehicleId]);

  if (loadingGeo) return <p>Carregando área…</p>;
  if (errorGeo)   return <p style={{color:'red'}}>Erro: {errorGeo}</p>;

  return (
    <div style={{ padding:'1rem' }}>
      <h1>Rastreamento Diário</h1>
      <React.Suspense fallback={<p>Carregando mapa…</p>}>
        <VehicleMap vehicleId={vehicleId} />
      </React.Suspense>
      <VehicleControls vehicleId={vehicleId} />
      {user.role==='admin' && (
        <React.Suspense fallback={<p>Carregando geofence…</p>}>
          <GeofenceEditor vehicleId={vehicleId} initialGeo={initialGeo}/>
        </React.Suspense>
      )}
      <p><Link to="/">Voltar</Link></p>
    </div>
  );
}
