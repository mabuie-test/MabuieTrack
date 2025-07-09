import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Stream HLS de um arquivo de vídeo pré-gravado
 * (substitua `input.mp4` pela fonte real do stream do veículo)
 */
export const streamVideo = (req, res) => {
  const { id } = req.params;
  // Aqui, hipoteticamente, cada veículo tem um arquivo em disk:
  const inputPath = path.resolve(process.cwd(), 'videos', `${id}.mp4`);
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

  ffmpeg(inputPath)
    .format('hls')
    .outputOptions([
      '-hls_time 2',        // duração de cada segmento em segundos
      '-hls_list_size 5',   // quantos segmentos manter no playlist
      '-hls_flags delete_segments'
    ])
    .on('error', err => {
      console.error('streamVideo FFmpeg error:', err);
      if (!res.headersSent) res.status(500).send('Erro no streaming');
    })
    .pipe(res, { end: true });
};
