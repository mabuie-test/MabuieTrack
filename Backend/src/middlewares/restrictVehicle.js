// Só permite acesso se for Admin ou se o veículo estiver alocado ao user
export const restrictVehicle = async (req, res, next) => {
  const { role, id: userId } = req.user;
  if (role === 'admin') return next();

  const User = (await import('../models/User.js')).default;
  const user = await User.findById(userId);
  if (!user.assignedCars.includes(req.params.id)) {
    return res.status(403).json({ message: 'Veículo não autorizado' });
  }
  next();
};
