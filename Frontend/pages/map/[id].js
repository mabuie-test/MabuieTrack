import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';
import VehicleControls from '../../src/components/VehicleControls';

// Dynamic import para evitar SSR de qualquer módulo Leaflet
const VehicleMap = dynamic(
  () => import('../../src/components/VehicleMap'),
  { ssr: false }
);
const GeofenceEditor = dynamic(
  () => import('../../src/components/GeofenceEditor'),
  { ssr: false }
);

export default function MapPage({ vehicleId }) {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Rastreamento Diário</h1>
      <VehicleMap vehicleId={vehicleId} />
      <VehicleControls vehicleId={vehicleId} />
      {user?.role === 'admin' && (
        <>
          <h2>Definir Área de Circulação</h2>
          <GeofenceEditor vehicleId={vehicleId} />
        </>
      )}
    </div>
  );
}

// SSR para rotas dinâmicas, sem expor Leaflet ao servidor
export async function getServerSideProps(context) {
  const { id } = context.params;
  return {
    props: { vehicleId: id }
  };
}
