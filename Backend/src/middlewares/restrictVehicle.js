// Só permite acesso se for Admin ou se o veículo estiver alocado ao user
export const restrictVehicle = async (req, res, next) => {
  const { role, id: userId } = req.user;
  if (role === 'admin') return next();

  // user só pode aceder aos seus veículos
  const Vehicle = await import('../models/Vehicle.js').then(m => m.default);
  const User    = await import('../models/User.js').then(m => m.default);
  const user    = await User.findById(userId);
  if (!user.assignedCars.includes(req.params.id)) {
    return res.status(403).json({ message: 'Veículo não autorizado' });
  }
  next();
};
