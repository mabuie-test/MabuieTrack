import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function VideoStream({ vehicleId }) {
  const videoRef = useRef();

  useEffect(() => {
    const video = videoRef.current;
    const hls = new Hls();
    const url = `${process.env.NEXT_PUBLIC_API}/api/vehicles/${vehicleId}/video/index.m3u8`;

    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS erro:', data);
    });

    return () => {
      hls.destroy();
    };
  }, [vehicleId]);

  return (
    <div className="my-4">
      <h2 className="text-lg font-bold mb-2">Vídeo em Tempo Real</h2>
      <video
        ref={videoRef}
        controls
        autoPlay
        style={{ width: '100%', maxHeight: '360px', background: 'black' }}
      />
    </div>
  );
}
