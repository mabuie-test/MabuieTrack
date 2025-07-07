import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';
import VehicleControls from '../../src/components/VehicleControls';

// Carrega componentes que usam Leaflet apenas no cliente
const VehicleMap     = dynamic(() => import('../../src/components/VehicleMap'),   { ssr: false });
const GeofenceEditor = dynamic(() => import('../../src/components/GeofenceEditor'), { ssr: false });

export default function MapPage({ vehicleId, initialGeo }) {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Rastreamento Diário</h1>
      <VehicleMap vehicleId={vehicleId} />

      <VehicleControls vehicleId={vehicleId} />

      {user?.role === 'admin' && (
        <>
          <h2>Definir Área de Circulação</h2>
          <GeofenceEditor vehicleId={vehicleId} initialGeo={initialGeo} />
        </>
      )}
    </div>
  );
}

// SSR para rotas dinâmicas, com fallback de variáveis de ambiente
export async function getServerSideProps({ params }) {
  // Primeiro tenta API_URL (SSR), depois NEXT_PUBLIC_API (fallback), depois localhost
  const base = process.env.API_URL
            || process.env.NEXT_PUBLIC_API
            || 'http://localhost:5000';

  const res = await fetch(`${base}/api/vehicles/${params.id}`);
  if (res.status === 404) {
    return { notFound: true };
  }
  if (!res.ok) {
    throw new Error(`Erro ao buscar veículo: ${res.status}`);
  }
  const vehicle = await res.json();
  return {
    props: {
      vehicleId:  params.id,
      initialGeo: vehicle.geofence || null
    }
  };
}
