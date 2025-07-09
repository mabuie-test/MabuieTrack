const express = require('express');
const router = express.Router();
const {
  createVehicle,
  getVehicles,
  getVehicleById
} = require('../controllers/vehicleController');
const authenticate = require('../middlewares/authenticateJWT');
const authorize = require('../middlewares/authorizeRoles');
const restrictVehicle = require('../middlewares/restrictVehicle');

router.post('/', authenticate, authorize('user', 'admin'), createVehicle);
router.get('/', authenticate, authorize('user', 'admin'), getVehicles);
router.get('/:id', authenticate, restrictVehicle, getVehicleById);

module.exports = router;
