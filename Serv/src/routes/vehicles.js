// src/routes/vehicles.js
import { Router } from 'express';
import fs          from 'fs';
import path        from 'path';
import turfBoolean from '@turf/boolean-point-in-polygon';
import { point as turfPoint, polygon as turfPolygon } from '@turf/helpers';

import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';

import Vehicle            from '../models/Vehicle.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles }  from '../middlewares/authorizeRoles.js';
import { restrictVehicle } from '../middlewares/restrictVehicle.js';
import { ensureHlsStream } from '../services/videoStream.js';

const router = Router();

// Todas as rotas de veículos exigem autenticação
router.use(authenticateJWT);

/**
 * 0) GET /api/vehicles/:id
 *    Detalhes do veículo (inclui geofence, rtspUrl, etc.)
 */
router.get(
  '/:id',
  authorizeRoles('admin','user'),
  restrictVehicle,
  getVehicle
);

/**
 * 1) POST /api/vehicles/:id/geofence
 *    Definir ou atualizar o geofence (admin only)
 */
router.post(
  '/:id/geofence',
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { coordinates } = req.body; // array de [ [lng, lat], ... ]
      const v = await Vehicle.findByIdAndUpdate(
        id,
        { geofence: { type: 'Polygon', coordinates: [coordinates] } },
        { new: true }
      );
      if (!v) return res.sendStatus(404);
      return res.json({ message: 'Geofence atualizado', geofence: v.geofence });
    } catch (err) {
      console.error('geofence:', err);
      return res.status(500).json({ message: 'Erro ao atualizar geofence' });
    }
  }
);

/**
 * 2) POST /api/vehicles/:id/telemetry
 *    Recebe telemetria, salva, emite Socket.IO e verifica geofence
 */
router.post(
  '/:id/telemetry',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { lat, lng, speed = 0, battery = 0 } = req.body;
      const v = await Vehicle.findById(id);
      if (!v) return res.sendStatus(404);

      const point = { lat, lng, speed, battery, at: new Date() };
      v.telemetry.push(point);
      await v.save();

      const io = req.app.get('io');
      io.to(`vehicle_${id}`).emit('newTelemetry', { vehicleId: id, point });

      // Verificação de geofence
      if (v.geofence?.coordinates?.length) {
        const inside = turfBoolean(
          turfPoint([lng, lat]),
          turfPolygon(v.geofence.coordinates)
        );
        if (!inside) {
          io.to(`vehicle_${id}`).emit('geofenceViolation', { vehicleId: id });
        }
      }

      return res.json({ ok: true });
    } catch (err) {
      console.error('telemetry:', err);
      return res.status(500).json({ message: 'Erro ao processar telemetria' });
    }
  }
);

/**
 * 3) GET /api/vehicles/:id/history?range=day|week|month
 *    Histórico filtrado por data (admin ou user alocado)
 */
router.get(
  '/:id/history',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { range = 'day' } = req.query;
      const multipliers = { day:1, week:7, month:30 };
      const cutoff = new Date(Date.now() - multipliers[range] * 24*3600*1000);
      const v = await Vehicle.findById(id);
      if (!v) return res.sendStatus(404);
      const hist = v.telemetry.filter(t => t.at >= cutoff);
      return res.json(hist);
    } catch (err) {
      console.error('history:', err);
      return res.status(500).json({ message: 'Erro ao obter histórico' });
    }
  }
);

/**
 * 4) POST /api/vehicles/:id/engine-kill
 *    Emite comando de corte de motor (admin ou user alocado)
 */
router.post(
  '/:id/engine-kill',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    try {
      const { id } = req.params;
      const v = await Vehicle.findById(id);
      if (!v) return res.sendStatus(404);

      const io = req.app.get('io');
      io.to(`vehicle_${id}`).emit('engineStatus', { vehicleId: id, status: 'disabled' });
      return res.json({ message: 'Comando de corte enfileirado' });
    } catch (err) {
      console.error('engine-kill:', err);
      return res.status(500).json({ message: 'Erro ao cortar motor' });
    }
  }
);

/**
 * 5) POST /api/vehicles/:id/engine-enable
 *    Emite comando de habilitar motor (admin ou user alocado)
 */
router.post(
  '/:id/engine-enable',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    try {
      const { id } = req.params;
      const v = await Vehicle.findById(id);
      if (!v) return res.sendStatus(404);

      const io = req.app.get('io');
      io.to(`vehicle_${id}`).emit('engineStatus', { vehicleId: id, status: 'enabled' });
      return res.json({ message: 'Comando de habilitação enfileirado' });
    } catch (err) {
      console.error('engine-enable:', err);
      return res.status(500).json({ message: 'Erro ao habilitar motor' });
    }
  }
);

/**
 * 6) GET /api/vehicles
 *    Listagem de veículos (admin vê todos; user só os seus)
 */
router.get('/', authorizeRoles('admin','user'), listVehicles);

/**
 * 7) CRUD de veículos (admin only)
 */
router.post('/',  authorizeRoles('admin'), createVehicle);
router.put('/:id', authorizeRoles('admin'), updateVehicle);
router.delete('/:id', authorizeRoles('admin'), deleteVehicle);

/**
 * 8) GET /api/vehicles/:id/video/:filename
 *    Streaming HLS de vídeo (cria e serve segmentos .m3u8/.ts)
 */
router.get(
  '/:id/video/:filename',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    try {
      const { id, filename } = req.params;
      const v = await Vehicle.findById(id);
      if (!v?.rtspUrl) return res.sendStatus(404);

      // Garante que o stream HLS está a correr
      ensureHlsStream(id, v.rtspUrl);

      // Envia o ficheiro pedido
      const filePath = path.resolve('/tmp/streams', id, filename);
      if (!fs.existsSync(filePath)) return res.sendStatus(404);
      return res.sendFile(filePath);
    } catch (err) {
      console.error('video-stream:', err);
      return res.status(500).json({ message: 'Erro ao servir vídeo' });
    }
  }
);

export default router;
