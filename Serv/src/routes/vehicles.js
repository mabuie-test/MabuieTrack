import { ensureHlsStream } from '../services/videoStream.js';
import fs                    from 'fs';
import path                  from 'path';

// ...

/**
 * 8) Servir segmentos HLS
 * GET /api/vehicles/:id/video/:filename
 */
router.get(
  '/:id/video/:filename',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    try {
      const { id, filename } = req.params;
      // Busca o URL RTSP guardado no documento
      const v = await Vehicle.findById(id);
      if (!v?.rtspUrl) return res.sendStatus(404);

      // Inicia (ou assegura) o streaming HLS
      ensureHlsStream(id, v.rtspUrl);

      // Serve o ficheiro pedido
      const filePath = path.resolve('/tmp/streams', id, filename);
      if (!fs.existsSync(filePath)) {
        return res.sendStatus(404);
      }
      return res.sendFile(filePath);
    } catch (err) {
      console.error('video-stream:', err);
      return res.status(500).json({ message: 'Erro ao servir vídeo' });
    }
  }
);
