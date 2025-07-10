// src/routes/vehicles.js
import { Router } from 'express';
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles }  from '../middlewares/authorizeRoles.js';
import { restrictVehicle } from '../middlewares/restrictVehicle.js';

const router = Router();

// todas as rotas exigem JWT
router.use(authenticateJWT);

router.get('/:id', authorizeRoles('admin','user'), restrictVehicle, getVehicle);
router.get('/',    authorizeRoles('admin','user'), listVehicles);

// CRUD
router.post('/',   authorizeRoles('admin'), createVehicle);
router.put('/:id', authorizeRoles('admin'), updateVehicle);
router.delete('/:id', authorizeRoles('admin'), deleteVehicle);

export default router;
