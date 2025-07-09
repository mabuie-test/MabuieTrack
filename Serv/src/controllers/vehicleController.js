// src/controllers/vehicleController.js
import Vehicle from '../models/Vehicle.js';
import User    from '../models/User.js';

/**
 * GET /api/vehicles
 * - Admin: retorna todos os veículos.
 * - User: retorna apenas os que lhe estão atribuídos.
 */
export const listVehicles = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'user') {
      const u = await User.findById(req.user.id);
      filter = { _id: { $in: u.assignedCars } };
    }
    const vs = await Vehicle.find(filter);
    res.json(vs);
  } catch (err) {
    console.error('listVehicles:', err);
    res.status(500).json({ message: 'Erro ao listar veículos' });
  }
};

/**
 * GET /api/vehicles/:id
 * - Retorna detalhes do veículo (inclui geofence, plate, model, owner, telemetry).
 */
export const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const v = await Vehicle.findById(id).populate('owner', 'email role');
    if (!v) return res.sendStatus(404);
    res.json(v);
  } catch (err) {
    console.error('getVehicle:', err);
    res.status(500).json({ message: 'Erro ao buscar veículo' });
  }
};

/**
 * POST /api/vehicles
 * - Cria um novo veículo e associa ao ownerId (admin only).
 */
export const createVehicle = async (req, res) => {
  try {
    const { plate, model, ownerId } = req.body;
    const v = new Vehicle({ plate, model, owner: ownerId });
    await v.save();
    if (ownerId) {
      await User.findByIdAndUpdate(ownerId, { $push: { assignedCars: v._id } });
    }
    res.status(201).json(v);
  } catch (err) {
    console.error('createVehicle:', err);
    res.status(500).json({ message: 'Erro ao criar veículo' });
  }
};

/**
 * PUT /api/vehicles/:id
 * - Atualiza plate, model e owner do veículo (admin only).
 */
export const updateVehicle = async (req, res) => {
  try {
    const { plate, model, ownerId } = req.body;
    const v = await Vehicle.findById(req.params.id);
    if (!v) return res.sendStatus(404);

    // Reatribui se owner mudou
    if (ownerId && v.owner?.toString() !== ownerId) {
      if (v.owner) {
        await User.findByIdAndUpdate(v.owner, { $pull: { assignedCars: v._id } });
      }
      await User.findByIdAndUpdate(ownerId, { $push: { assignedCars: v._id } });
    }

    v.plate = plate;
    v.model = model;
    v.owner = ownerId;
    await v.save();
    res.json(v);
  } catch (err) {
    console.error('updateVehicle:', err);
    res.status(500).json({ message: 'Erro ao atualizar veículo' });
  }
};

/**
 * DELETE /api/vehicles/:id
 * - Elimina o veículo e o remove da lista do owner (admin only).
 */
export const deleteVehicle = async (req, res) => {
  try {
    const v = await Vehicle.findByIdAndDelete(req.params.id);
    if (!v) return res.sendStatus(404);
    if (v.owner) {
      await User.findByIdAndUpdate(v.owner, { $pull: { assignedCars: v._id } });
    }
    res.json({ message: 'Veículo eliminado' });
  } catch (err) {
    console.error('deleteVehicle:', err);
    res.status(500).json({ message: 'Erro ao eliminar veículo' });
  }
};
