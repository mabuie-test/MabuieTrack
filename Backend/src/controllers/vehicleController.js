import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

// GET /api/vehicles
export const listVehicles = async (req, res) => {
  let filter = {};
  if (req.user.role === 'user') {
    const u = await User.findById(req.user.id);
    filter = { _id: { $in: u.assignedCars } };
  }
  const vs = await Vehicle.find(filter);
  res.json(vs);
};

// POST /api/vehicles
export const createVehicle = async (req, res) => {
  const { plate, model, ownerId } = req.body;
  const v = new Vehicle({ plate, model, owner: ownerId });
  await v.save();
  if (ownerId) {
    await User.findByIdAndUpdate(ownerId, { $push: { assignedCars: v._id } });
  }
  res.status(201).json(v);
};

// PUT /api/vehicles/:id
export const updateVehicle = async (req, res) => {
  const { plate, model, ownerId } = req.body;
  const v = await Vehicle.findById(req.params.id);
  if (ownerId && v.owner?.toString() !== ownerId) {
    await User.findByIdAndUpdate(v.owner, { $pull: { assignedCars: v._id } });
    await User.findByIdAndUpdate(ownerId, { $push: { assignedCars: v._id } });
  }
  v.plate = plate;
  v.model = model;
  v.owner = ownerId;
  await v.save();
  res.json(v);
};

// DELETE /api/vehicles/:id
export const deleteVehicle = async (req, res) => {
  const v = await Vehicle.findByIdAndDelete(req.params.id);
  if (v.owner) {
    await User.findByIdAndUpdate(v.owner, { $pull: { assignedCars: v._id } });
  }
  res.json({ message: 'Veículo eliminado' });
};
