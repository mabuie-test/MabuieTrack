import 'styles/globals.css';            // Tailwind + estilos globais
import 'leaflet/dist/leaflet.css';      // CSS do Leaflet
import 'leaflet-draw/dist/leaflet.draw.css'; // CSS do Leaflet-Draw

import { AuthProvider } from '../contexts/AuthContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
