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
    const vs = await Vehicle.find(filter).populate('owner', 'username email');
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
    const v = await Vehicle.findById(id)
      .populate('owner', 'username email');
    if (!v) return res.status(404).json({ message: 'Veículo não encontrado' });
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

    // Validação mínima
    if (!plate || !plate.trim()) {
      return res.status(400).json({ message: 'O campo "plate" é obrigatório.' });
    }

    // Cria o veículo
    const v = new Vehicle({
      plate: plate.trim(),
      model: model?.trim() || '',
      owner: ownerId || undefined
    });
    await v.save();

    // Se veio ownerId, associa o carro ao usuário
    if (ownerId) {
      await User.findByIdAndUpdate(ownerId, {
        $addToSet: { assignedCars: v._id }
      });
    }

    res.status(201).json(v);
  } catch (err) {
    console.error('createVehicle:', err);

    // Placa duplicada
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Já existe um veículo cadastrado com esta placa.'
      });
    }

    // Erro de validação do Mongoose
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: 'Erro interno ao criar veículo' });
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
    if (!v) return res.status(404).json({ message: 'Veículo não encontrado' });

    // Se owner mudou, ajusta assignedCars
    if (ownerId && String(v.owner) !== ownerId) {
      if (v.owner) {
        await User.findByIdAndUpdate(v.owner, {
          $pull: { assignedCars: v._id }
        });
      }
      await User.findByIdAndUpdate(ownerId, {
        $addToSet: { assignedCars: v._id }
      });
    }

    v.plate = plate?.trim() || v.plate;
    v.model = model?.trim() || v.model;
    v.owner = ownerId || null;
    await v.save();

    res.json(v);
  } catch (err) {
    console.error('updateVehicle:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Já existe um veículo cadastrado com esta placa.'
      });
    }
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
    if (!v) return res.status(404).json({ message: 'Veículo não encontrado' });

    if (v.owner) {
      await User.findByIdAndUpdate(v.owner, {
        $pull: { assignedCars: v._id }
      });
    }
    res.json({ message: 'Veículo eliminado com sucesso' });
  } catch (err) {
    console.error('deleteVehicle:', err);
    res.status(500).json({ message: 'Erro ao eliminar veículo' });
  }
};
