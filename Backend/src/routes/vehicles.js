import { Router } from 'express';
import {
  listVehicles, createVehicle, updateVehicle, deleteVehicle
} from '../controllers/vehicleController.js';

import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles }  from '../middlewares/authorizeRoles.js';
import { restrictVehicle } from '../middlewares/restrictVehicle.js';
import Vehicle             from '../models/Vehicle.js';

import turfBoolean         from '@turf/boolean-point-in-polygon';
import { point as turfPoint, polygon as turfPolygon } from '@turf/helpers';

const r = Router();

// Todas as rotas exigem token
r.use(authenticateJWT);

// 1) Definir/atualizar Geofence (admin)
r.post(
  '/:id/geofence',
  authorizeRoles('admin'),
  async (req, res) => {
    const { id } = req.params;
    const { coordinates } = req.body; // array de [lng, lat]
    const v = await Vehicle.findByIdAndUpdate(
      id,
      { geofence: { type: 'Polygon', coordinates: [coordinates] } },
      { new: true }
    );
    if (!v) return res.sendStatus(404);
    return res.json({ message: 'Geofence atualizado', geofence: v.geofence });
  }
);

// 2) Envio de telemetria, emissão de Socket.IO e verificação de geofence
r.post(
  '/:id/telemetry',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    const { id } = req.params;
    const { lat, lng, speed = 0, battery = 0 } = req.body;
    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);

    const point = { lat, lng, speed, battery, at: new Date() };
    v.telemetry.push(point);
    await v.save();

    // Obtém a instância do Socket.IO
    const io = req.app.get('io');
    io.to(`vehicle_${id}`).emit('newTelemetry', { vehicleId: id, point });

    // Geofence: se definido e o ponto estiver fora
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
  }
);

// 3) Histórico estático inicial
r.get(
  '/:id/history',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    const { id } = req.params;
    const { range = 'day' } = req.query;
    const multipliers = { day:1, week:7, month:30 };
    const cutoff = new Date(Date.now() - multipliers[range]*24*3600*1000);
    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);
    const hist = v.telemetry.filter(t => t.at >= cutoff);
    return res.json(hist);
  }
);

// 4) Engine‑kill (admin ou user)
r.post(
  '/:id/engine-kill',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    const { id } = req.params;
    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);

    const io = req.app.get('io');
    io.to(`vehicle_${id}`).emit('engineStatus', { vehicleId: id, status: 'disabled' });
    return res.json({ message: 'Comando de corte enfileirado' });
  }
);

// 5) Engine‑enable (admin ou user)
r.post(
  '/:id/engine-enable',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    const { id } = req.params;
    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);

    const io = req.app.get('io');
    io.to(`vehicle_${id}`).emit('engineStatus', { vehicleId: id, status: 'enabled' });
    return res.json({ message: 'Comando de habilitação enfileirado' });
  }
);

// 6) Listagem de veículos
r.get('/', authorizeRoles('admin','user'), listVehicles);

// 7) CRUD de veículos (admin)
r.post('/', authorizeRoles('admin'), createVehicle);
r.put('/:id', authorizeRoles('admin'), updateVehicle);
r.delete('/:id', authorizeRoles('admin'), deleteVehicle);

export default r;
