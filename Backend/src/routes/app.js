import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB }          from './config/db.js';
import authRoutes            from './routes/auth.js';
import userRoutes            from './routes/users.js';
import vehicleRoutes         from './routes/vehicles.js';

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);

app.get('/', (_, res) => res.json({ message: 'Backend a funcionar' }));

export default app;
