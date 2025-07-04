import User from '../models/User.js';

// GET /api/users
export const listUsers = async (req, res) => {
  const users = await User.find().select('-passwordHash');
  res.json(users);
};

// GET /api/users/:id
export const getUser = async (req, res) => {
  const u = await User.findById(req.params.id).select('-passwordHash');
  if (!u) return res.sendStatus(404);
  res.json(u);
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  const { username, email, role, assignedCars } = req.body;
  const u = await User.findByIdAndUpdate(
    req.params.id,
    { username, email, role, assignedCars },
    { new: true }
  ).select('-passwordHash');
  res.json(u);
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Utilizador eliminado' });
};
