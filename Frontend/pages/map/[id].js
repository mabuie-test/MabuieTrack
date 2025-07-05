import { useRouter } from 'next/router';
import useSWR        from 'swr';
import dynamic       from 'next/dynamic';
import api           from '../../src/api';

// Carrega o map sem SSR
const VehicleMap = dynamic(
  () => import('../../src/components/VehicleMap'),
  { ssr: false }
);

export default function MapPage() {
  const { query } = useRouter();
  const id = query.id;

  // Fetch client‑side do histórico daquele veículo
  const { data, error } = useSWR(
    () => id ? `/vehicles/${id}/history?range=day` : null,
    url => api.get(url).then(r => r.data)
  );

  if (error) return <p>Erro ao carregar posições.</p>;
  if (!data)  return <p>Carregando…</p>;

  const positions = data.map(p => ({ lat: p.lat, lng: p.lng }));

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Rastreamento Diário</h1>
      <VehicleMap positions={positions} />
    </div>
  );
}
