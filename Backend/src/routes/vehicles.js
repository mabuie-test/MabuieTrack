import { Router } from 'express';
import {
  listVehicles, getVehicle,
  createVehicle, updateVehicle, deleteVehicle
} from '../controllers/vehicleController.js';
import { authenticateJWT } from '../middlewares/authenticateJWT.js';
import { authorizeRoles }  from '../middlewares/authorizeRoles.js';
import { restrictVehicle } from '../middlewares/restrictVehicle.js';
import turfBoolean from '@turf/boolean-point-in-polygon';
import { point as turfPoint, polygon as turfPolygon } from '@turf/helpers';
import Vehicle     from '../models/Vehicle.js';

const r = Router();
r.use(authenticateJWT);

/** 0) Detalhes do veículo */
r.get('/:id', authorizeRoles('admin','user'), restrictVehicle, getVehicle);

/** 1) Geofence (admin only) */
r.post('/:id/geofence', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { coordinates } = req.body;
    const v = await Vehicle.findByIdAndUpdate(
      id,
      { geofence: { type:'Polygon', coordinates:[coordinates] } },
      { new:true }
    );
    if (!v) return res.sendStatus(404);
    res.json({ message:'Geofence atualizado', geofence:v.geofence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Erro ao atualizar geofence' });
  }
});

/** 2) Telemetria */
r.post('/:id/telemetry', authorizeRoles('admin','user'), restrictVehicle, async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, speed=0, battery=0 } = req.body;
    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);
    const point = { lat, lng, speed, battery, at:new Date() };
    v.telemetry.push(point);
    await v.save();
    const io = req.app.get('io');
    io.to(`vehicle_${id}`).emit('newTelemetry',{ vehicleId:id, point });
    if (v.geofence?.coordinates?.length) {
      const inside = turfBoolean(
        turfPoint([lng,lat]),
        turfPolygon(v.geofence.coordinates)
      );
      if (!inside) io.to(`vehicle_${id}`).emit('geofenceViolation',{ vehicleId:id });
    }
    res.json({ ok:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Erro ao processar telemetria' });
  }
});

/** 3) Histórico */
r.get('/:id/history', authorizeRoles('admin','user'), restrictVehicle, async (req, res) => {
  try {
    const { id } = req.params;
    const { range='day' } = req.query;
    const mul = { day:1, week:7, month:30 }[range];
    const cutoff = new Date(Date.now() - mul*24*3600*1000);
    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);
    res.json(v.telemetry.filter(t => t.at >= cutoff));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Erro ao obter histórico' });
  }
});

/** 4) Engine‑kill */
r.post('/:id/engine-kill', authorizeRoles('admin','user'), restrictVehicle, async (req, res) => {
  try {
    const { id } = req.params;
    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);
    const io = req.app.get('io');
    io.to(`vehicle_${id}`).emit('engineStatus',{ vehicleId:id, status:'disabled' });
    res.json({ message:'Comando de corte enfileirado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Erro ao cortar motor' });
  }
});

/** 5) Engine‑enable */
r.post('/:id/engine-enable', authorizeRoles('admin','user'), restrictVehicle, async (req, res) => {
  try {
    const { id } = req.params;
    const v = await Vehicle.findById(id);
    if (!v) return res.sendStatus(404);
    const io = req.app.get('io');
    io.to(`vehicle_${id}`).emit('engineStatus',{ vehicleId:id, status:'enabled' });
    res.json({ message:'Comando de habilitação enfileirado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Erro ao habilitar motor' });
  }
});

/** 6) Listagem */
r.get('/', authorizeRoles('admin','user'), listVehicles);

/** 7) CRUD veículos */
r.post('/', authorizeRoles('admin'), createVehicle);
r.put('/:id', authorizeRoles('admin'), updateVehicle);
r.delete('/:id', authorizeRoles('admin'), deleteVehicle);

export default r;
