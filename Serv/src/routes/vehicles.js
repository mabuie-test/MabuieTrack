// src/routes/vehicles.js
import { Router } from 'express';
import path       from 'path';
import fs         from 'fs';
import Vehicle    from '../models/Vehicle.js';
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import turfBoolean        from '@turf/boolean-point-in-polygon';
import { point as turfPoint, polygon as turfPolygon } from '@turf/helpers';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles }  from '../middlewares/authorizeRoles.js';
import { restrictVehicle } from '../middlewares/restrictVehicle.js';
import { ensureHlsStream } from '../services/videoStream.js';

const router = Router();

// todas as rotas exigem token
router.use(authenticateJWT);

/**
 * 0) GET /api/vehicles/:id
 *    detalhes do veículo (inclui geofence, rtspUrl)
 */
router.get(
  '/:id',
  authorizeRoles('admin','user'),
  restrictVehicle,
  getVehicle
);

/**
 * 1) POST /api/vehicles/:id/geofence
 *    define ou atualiza o geofence
 */
router.post(
  '/:id/geofence',
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { coordinates } = req.body; // array [ [lng,lat], ... ]
      const v = await Vehicle.findByIdAndUpdate(
        id,
        { geofence: { type: 'Polygon', coordinates: [coordinates] } },
        { new: true }
      );
      if (!v) return res.sendStatus(404);
      res.json({ message: 'Geofence atualizado', geofence: v.geofence });
    } catch (err) {
      console.error('geofence:', err);
      res.status(500).json({ message: 'Erro ao atualizar geofence' });
    }
  }
);

/**
 * 2) POST /api/vehicles/:id/telemetry
 *    recebe telemetria, salva, emite Socket.IO e verifica geofence
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

      if (v.geofence?.coordinates?.length) {
        const inside = turfBoolean(
          turfPoint([lng, lat]),
          turfPolygon(v.geofence.coordinates)
        );
        if (!inside) {
          io.to(`vehicle_${id}`).emit('geofenceViolation', { vehicleId: id });
        }
      }

      res.json({ ok: true });
    } catch (err) {
      console.error('telemetry:', err);
      res.status(500).json({ message: 'Erro ao processar telemetria' });
    }
  }
);

/**
 * 3) GET /api/vehicles/:id/history
 *    histórico filtrado por range
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
      const cutoff = new Date(Date.now() - multipliers[range]*24*3600*1000);
      const v = await Vehicle.findById(id);
      if (!v) return res.sendStatus(404);
      const hist = v.telemetry.filter(t => t.at >= cutoff);
      res.json(hist);
    } catch (err) {
      console.error('history:', err);
      res.status(500).json({ message: 'Erro ao obter histórico' });
    }
  }
);

/**
 * 4) & 5) engine-kill / engine-enable
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
      res.json({ message: 'Comando de corte enfileirado' });
    } catch (err) {
      console.error('engine-kill:', err);
      res.status(500).json({ message: 'Erro ao cortar motor' });
    }
  }
);

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
      res.json({ message: 'Comando de habilitação enfileirado' });
    } catch (err) {
      console.error('engine-enable:', err);
      res.status(500).json({ message: 'Erro ao habilitar motor' });
    }
  }
);

/**
 * 6) Listagem geral
 */
router.get('/', authorizeRoles('admin','user'), listVehicles);

/**
 * 7) CRUD (admin)
 */
router.post('/', authorizeRoles('admin'), createVehicle);
router.put('/:id', authorizeRoles('admin'), updateVehicle);
router.delete('/:id', authorizeRoles('admin'), deleteVehicle);

/**
 * 8) Streaming de vídeo HLS: /api/vehicles/:id/video/*
 */
router.get('/:id/video/:filename', async (req, res) => {
  try {
    const { id, filename } = req.params;
    // carrega o veículo para obter o rtspUrl
    const v = await Vehicle.findById(id);
    if (!v?.rtspUrl) return res.sendStatus(404);

    // garante pasta e playlist gerados
    ensureHlsStream(id, v.rtspUrl);

    const filePath = path.resolve('/tmp/streams', id, filename);
    if (!fs.existsSync(filePath)) return res.sendStatus(404);
    res.sendFile(filePath);
  } catch (err) {
    console.error('video-stream:', err);
    res.status(500).json({ message: 'Erro ao servir vídeo' });
  }
});

export default router;
