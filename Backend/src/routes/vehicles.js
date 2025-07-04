import { Router } from 'express';
import {
  listVehicles, createVehicle, updateVehicle, deleteVehicle
} from '../controllers/vehicleController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const r = Router();
r.use(authenticateJWT);
r.get('/', authorizeRoles('admin','user'), listVehicles);
r.post('/', authorizeRoles('admin'), createVehicle);
r.put('/:id', authorizeRoles('admin'), updateVehicle);
r.delete('/:id', authorizeRoles('admin'), deleteVehicle);
export default r;
