import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const VehicleMap     = dynamic(() => import('../../components/VehicleMap'),   { ssr: false });
const VehicleControls= dynamic(() => import('../../components/VehicleControls'),{ ssr: false });
const GeofenceEditor= dynamic(() => import('../../components/GeofenceEditor'),{ ssr: false });

export default function MapPage() {
  const { id } = useRouter().query;
  const { user } = useAuth();
  const [geofence, setGeofence] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/vehicles/${id}`)
      .then(r => setGeofence(r.data.geofence))
      .catch(e => setError(e.response?.data?.message||e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-4">Carregando…</p>;
  if (error)   return <p className="p-4 text-red-500">Erro: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rastreamento Diário</h1>
      <VehicleMap vehicleId={id} />
      <VehicleControls vehicleId={id} />
      {user.role === 'admin' && (
        <>
          <h2 className="text-xl mt-6 mb-2">Definir Área de Circulação</h2>
          <GeofenceEditor vehicleId={id} initialGeo={geofence} />
        </>
      )}
    </div>
  );
}
