import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';
import VehicleControls from '../../src/components/VehicleControls';

// Carrega os componentes que usam Leaflet apenas no cliente
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

// SSR para rotas dinâmicas, usando API_URL no servidor
export async function getServerSideProps({ params }) {
  const API_URL = process.env.API_URL;  // Definida no painel do Render
  const res = await fetch(`${API_URL}/api/vehicles/${params.id}`);
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
