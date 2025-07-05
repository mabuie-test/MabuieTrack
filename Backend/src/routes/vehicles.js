import { Router } from 'express';
import {
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';

import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles }  from '../middlewares/authorizeRoles.js';
import { restrictVehicle } from '../middlewares/restrictVehicle.js';
import Vehicle             from '../models/Vehicle.js';

const r = Router();

// 1) Todas as rotas de veículos exigem token
r.use(authenticateJWT);

// 2) Envio de telemetria (admin ou user alocado)
//    POST /api/vehicles/:id/telemetry
r.post(
  '/:id/telemetry',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    const { id } = req.params;
    const { lat, lng, speed = 0, bat = 0 } = req.body;
    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);

    v.telemetry.push({ lat, lng, speed, bat, at: new Date() });
    await v.save();
    return res.json({ ok: true });
  }
);

// 3) Listagem de veículos
//    GET /api/vehicles
//    admin vê todos; user só os seus
r.get('/', authorizeRoles('admin','user'), listVehicles);

// 4) Histórico de um veículo específico
//    GET /api/vehicles/:id/history?range=day|week|month
r.get(
  '/:id/history',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    const { id }        = req.params;
    const { range = 'day' } = req.query;
    const multipliers   = { day: 1, week: 7, month: 30 };
    const sinceMs       = multipliers[range] * 24 * 3600 * 1000;
    const cutoff        = new Date(Date.now() - sinceMs);
    const v             = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);

    // Filtra só as leituras após o cutoff
    const hist = v.telemetry.filter(t => t.at >= cutoff);
    return res.json(hist);
  }
);

// 5) Endpoints de administração de veículos (só admin)
//    POST   /api/vehicles
//    PUT    /api/vehicles/:id
//    DELETE /api/vehicles/:id
r.post('/', authorizeRoles('admin'), createVehicle);
r.put('/:id', authorizeRoles('admin'), updateVehicle);
r.delete('/:id', authorizeRoles('admin'), deleteVehicle);

export default r;
