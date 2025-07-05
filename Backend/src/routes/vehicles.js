import { Router } from 'express';
import {
  listVehicles, createVehicle, updateVehicle, deleteVehicle
} from '../controllers/vehicleController.js';

import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles }  from '../middlewares/authorizeRoles.js';
import { restrictVehicle } from '../middlewares/restrictVehicle.js';
import Vehicle             from '../models/Vehicle.js';
import { io }              from '../server.js';   // importar io

const r = Router();

// Todas as rotas exigem token
r.use(authenticateJWT);

// POST /:id/telemetry – recebe telemetria e emite via WebSocket
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

    // Emite apenas para quem entrou na sala deste veículo
    io.to(`vehicle_${id}`).emit('newTelemetry', { vehicleId: id, point });

    return res.json({ ok: true });
  }
);

// GET / – listagem
r.get('/', authorizeRoles('admin','user'), listVehicles);

// GET /:id/history – histórico estático inicial
r.get(
  '/:id/history',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    const { id } = req.params;
    const { range = 'day' } = req.query;
    const multipliers = { day: 1, week: 7, month: 30 };
    const cutoff = new Date(Date.now() - multipliers[range] * 24*3600*1000);
    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);
    const hist = v.telemetry.filter(t => t.at >= cutoff);
    return res.json(hist);
  }
);

// CRUD de veículos (admin)
r.post('/', authorizeRoles('admin'), createVehicle);
r.put('/:id', authorizeRoles('admin'), updateVehicle);
r.delete('/:id', authorizeRoles('admin'), deleteVehicle);

export default r;
