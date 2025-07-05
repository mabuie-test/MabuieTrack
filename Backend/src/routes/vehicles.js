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

// Middleware global: só se chega aqui autenticado
r.use(authenticateJWT);

// Listagem (admin vê todos; user só os seus)
r.get('/', authorizeRoles('admin','user'), listVehicles);

// Histórico de um veículo específico
r.get(
  '/:id/history',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    const { id }      = req.params;
    const { range='day' } = req.query; // 'day' | 'week' | 'month'
    const multipliers = { day:1, week:7, month:30 };
    const sinceMs     = multipliers[range] * 24 * 3600 * 1000;
    const cutoff      = new Date(Date.now() - sinceMs);

    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);
    const hist = v.telemetry.filter(t => t.at >= cutoff);
    res.json(hist);
  }
);

// Criação, edição e eliminação só por Admin
r.post('/', authorizeRoles('admin'), createVehicle);
r.put('/:id', authorizeRoles('admin'), updateVehicle);
r.delete('/:id', authorizeRoles('admin'), deleteVehicle);

export default r;
