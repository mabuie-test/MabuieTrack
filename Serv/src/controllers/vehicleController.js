// src/controllers/vehicleController.js

import Vehicle from '../models/Vehicle.js';
import User    from '../models/User.js';

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

    const normalizedPlate = plate.trim().toUpperCase();

    // Verificar duplicidade ANTES de tentar salvar
    const existingVehicle = await Vehicle.findOne({ plate: normalizedPlate });
    if (existingVehicle) {
      return res.status(400).json({
        message: 'Já existe um veículo cadastrado com esta placa.'
      });
    }

    const v = new Vehicle({
      plate: normalizedPlate,
      model: model?.trim() || '',
      owner: ownerId || undefined
    });
    await v.save();

    if (ownerId) {
      await User.findByIdAndUpdate(ownerId, {
        $addToSet: { assignedCars: v._id }
      });
    }

    return res.status(201).json(v);
  } catch (err) {
    console.error('createVehicle:', err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: 'Erro interno ao criar veículo' });
  }
};
