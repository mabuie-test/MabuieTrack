import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Guarda processos ativos por veículo
const processes = new Map();

/**
 * Garante que existe um stream HLS em /tmp/streams/<vehicleId>:
 * - Se ainda não estiver a correr, dispara um ffmpeg contínuo a ler de rtspUrl
 * - Segmenta em .ts e playlist .m3u8
 */
export function ensureHlsStream(vehicleId, rtspUrl) {
  const outDir = path.resolve('/tmp/streams', vehicleId);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  // Se já existe um processo FFmpeg para este veículo, não faz nada
  if (processes.has(vehicleId)) return;

  const proc = ffmpeg(rtspUrl)
    .addOption('-hide_banner')
    .addOption('-loglevel', 'error')
    .format('hls')
    .outputOptions([
      '-hls_time 2',              // duração de cada segmento em segundos
      '-hls_list_size 5',         // quantos segmentos manter na playlist
      '-hls_flags delete_segments',
      `-hls_segment_filename ${path.join(outDir, 'segment_%03d.ts')}`
    ])
    .output(path.join(outDir, 'index.m3u8'))
    .on('start', cmd => {
      console.log(`FFmpeg started for vehicle ${vehicleId}:`, cmd);
    })
    .on('error', (err, stdout, stderr) => {
      console.error(`FFmpeg error for vehicle ${vehicleId}:`, err.message);
      // Em caso de erro, remove do mapa para tentar reiniciar na próxima request
      processes.delete(vehicleId);
    })
    .on('end', () => {
      console.log(`FFmpeg ended for vehicle ${vehicleId}`);
      processes.delete(vehicleId);
    })
    .run();

  processes.set(vehicleId, proc);
}
