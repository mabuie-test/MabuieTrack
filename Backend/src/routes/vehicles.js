import { Router } from 'express';
import turfBoolean         from '@turf/boolean-point-in-polygon';
import { point as turfPoint, polygon as turfPolygon } from '@turf/helpers';
import Vehicle             from '../models/Vehicle.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles }  from '../middlewares/authorizeRoles.js';
import { restrictVehicle } from '../middlewares/restrictVehicle.js';

const r = Router();
r.use(authenticateJWT);

/**
 * POST /api/vehicles/:id/telemetry
 */
r.post(
  '/:id/telemetry',
  authorizeRoles('admin','user'),
  restrictVehicle,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { lat, lng, speed = 0, battery = 0 } = req.body;

      // Busca veículo
      const v = await Vehicle.findById(id);
      if (!v) return res.status(404).json({ message: 'Veículo não encontrado' });

      // Novo ponto
      const point = { lat, lng, speed, battery, at: new Date() };
      v.telemetry.push(point);
      await v.save();

      // Emite via Socket.IO
      const io = req.app.get('io');
      if (!io) {
        console.error('⚠️  O io NÃO está disponível em req.app');
      } else {
        io.to(`vehicle_${id}`).emit('newTelemetry', { vehicleId: id, point });
      }

      // Se houver geofence, verifica violação
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
      console.error('❌ Erro no POST /telemetry:', err);
      return res.status(500).json({ message: 'Erro ao processar telemetria' });
    }
  }
);

export default r;
