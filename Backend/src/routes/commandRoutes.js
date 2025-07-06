import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middlewares/authorizeRoles.js';
import {
  createEngineKillCommand,
  createEngineEnableCommand,
  listPendingCommands,
  acknowledgeCommand
} from '../controllers/commandController.js';

const r = Router();

r.post(
  '/vehicles/:id/engine-kill',
  authenticateJWT, authorizeRoles('admin','user'),
  createEngineKillCommand
);
r.post(
  '/vehicles/:id/engine-enable',
  authenticateJWT, authorizeRoles('admin','user'),
  createEngineEnableCommand
);
// endpoint para o dispositivo buscar
r.get('/vehicles/:id/commands', listPendingCommands);
// ack do dispositivo
r.post('/vehicles/:id/commands/:cmdId/ack', acknowledgeCommand);

export default r;
