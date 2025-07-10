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

    if (!plate?.trim()) {
      return res.status(400).json({ message: 'O campo "plate" é obrigatório.' });
    }

    // já faz trim e uppercase pra evitar duplicados por case
    const normalizedPlate = plate.trim().toUpperCase();

    // tenta criar
    const v = new Vehicle({
      plate: normalizedPlate,
      model: model?.trim() || '',
      owner: ownerId || undefined
    });
    await v.save();

    // associa ao usuário se houver ownerId
    if (ownerId) {
      await User.findByIdAndUpdate(ownerId, {
        $addToSet: { assignedCars: v._id }
      });
    }

    return res.status(201).json(v);
  } catch (err) {
    console.error('createVehicle:', err);

    // placa duplicada
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Já existe um veículo cadastrado com esta placa.'
      });
    }

    // outros erros de validação
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: 'Erro interno ao criar veículo' });
  }
};
