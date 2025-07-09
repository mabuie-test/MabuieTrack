import Vehicle from '../models/Vehicle.js';
import User    from '../models/User.js';

export const listVehicles = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'user') {
      const u = await User.findById(req.user.id);
      filter = { _id:{ $in:u.assignedCars } };
    }
    res.json(await Vehicle.find(filter));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Erro ao listar veículos' });
  }
};

export const getVehicle = async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id)
                           .populate('owner','email role');
    if (!v) return res.sendStatus(404);
    res.json(v);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Erro ao buscar veículo' });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { plate, model, ownerId } = req.body;
    const v = new Vehicle({ plate, model, owner:ownerId });
    await v.save();
    if (ownerId) {
      await User.findByIdAndUpdate(ownerId,{ $push:{ assignedCars:v._id } });
    }
    res.status(201).json(v);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Erro ao criar veículo' });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { plate, model, ownerId } = req.body;
    const v = await Vehicle.findById(req.params.id);
    if (!v) return res.sendStatus(404);
    if (ownerId && v.owner?.toString()!==ownerId) {
      if (v.owner) {
        await User.findByIdAndUpdate(v.owner,{ $pull:{ assignedCars:v._id } });
      }
      await User.findByIdAndUpdate(ownerId,{ $push:{ assignedCars:v._id } });
    }
    v.plate = plate; v.model = model; v.owner = ownerId;
    await v.save();
    res.json(v);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Erro ao atualizar veículo' });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const v = await Vehicle.findByIdAndDelete(req.params.id);
    if (!v) return res.sendStatus(404);
    if (v.owner) {
      await User.findByIdAndUpdate(v.owner,{ $pull:{ assignedCars:v._id } });
    }
    res.json({ message:'Veículo eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Erro ao eliminar veículo' });
  }
};
