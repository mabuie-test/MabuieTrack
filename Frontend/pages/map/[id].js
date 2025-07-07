import dynamic from 'next/dynamic';
import { useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';
import VehicleControls from '../../src/components/VehicleControls';
import GeofenceEditor  from '../../src/components/GeofenceEditor';

// Carrega o mapa apenas no cliente
const VehicleMap = dynamic(
  () => import('../../src/components/VehicleMap'),
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

// Esta função roda sempre no servidor e garante SSR para rotas dinâmicas
export async function getServerSideProps(context) {
  const { id } = context.params;
  return {
    props: {
      vehicleId: id
    }
  };
}
