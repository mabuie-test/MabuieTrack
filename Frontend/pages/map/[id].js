import { useRouter } from 'next/router';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import api from '../../src/api';

// Carrega o mapa apenas no cliente, importando do caminho correto
const VehicleMap = dynamic(
  () => import('../../src/components/VehicleMap'),
  { ssr: false }
);

export default function MapPage() {
  const { query } = useRouter();
  const id = query.id;

  // Apenas faz fetch quando `id` estiver definido
  const { data, error } = useSWR(
    () => (id ? `/vehicles/history?range=day` : null),
    url => api.get(url).then(r => r.data)
  );

  if (error) return <p>Erro ao carregar posições.</p>;
  if (!data)  return <p>Carregando…</p>;

  // Extrai apenas lat/lng
  const positions = data.map(p => ({ lat: p.lat, lng: p.lng }));

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Rastreamento Diário</h1>
      <VehicleMap positions={positions} />
    </div>
  );
}
