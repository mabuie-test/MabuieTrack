// backend/services/videoStream.js
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegPath.path);

// Gere HLS para cada veículo sob /tmp/streams/:id/
export function ensureHlsStream(vehicleId, rtspUrl) {
  const outDir = path.resolve('/tmp/streams', vehicleId);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const playlist = path.join(outDir, 'index.m3u8');
  // Se já existe e foi criado nos últimos X minutos, não recria
  const stat = fs.existsSync(playlist) && fs.statSync(playlist);
  if (stat && (Date.now() - stat.mtimeMs < 5 * 60 * 1000)) {
    return; // Já temos stream recente
  }

  // Iniciar ffmpeg para converter RTSP ➔ HLS
  ffmpeg(rtspUrl)
    .addOptions([
      '-profile:v baseline',  // compatível com HLS em HTML5
      '-level 3.0',
      '-s 640x360',           // resolução
      '-start_number 0',
      '-hls_time 2',          // cada segmento 2s
      '-hls_list_size 3',     // somente 3 segmentos no playlist
      '-f hls'
    ])
    .output(playlist)
    .on('start', cmd => console.log(`FFmpeg iniciado: ${cmd}`))
    .on('error', err => console.error('FFmpeg erro:', err.message))
    .run();
}
