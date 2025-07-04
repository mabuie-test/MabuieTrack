import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const signToken = user => jwt.sign(
  { sub: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

export const register = async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = new User({ 
    username, 
    email, 
    passwordHash: password, 
    role: role || 'user' 
  });
  await user.save();
  res.status(201).json({ message: 'Utilizador criado' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
  const token = signToken(user);
  res.json({ token });
};
