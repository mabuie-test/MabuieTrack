import dotenv from 'dotenv';
import http    from 'http';
import express from 'express';
import cors    from 'cors';
import morgan  from 'morgan';
import { Server as IOServer } from 'socket.io';
import { connectDB }          from './config/db.js';
import authRoutes             from './routes/auth.js';
import userRoutes             from './routes/users.js';
import vehicleRoutes          from './routes/vehicles.js';

dotenv.config();
const app = express();
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Monta HTTP + Socket.IO
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });
io.on('connection', socket => {
  console.log('👤 Socket conectado:', socket.id);
  socket.on('joinVehicle',   vid => socket.join(`vehicle_${vid}`));
  socket.on('leaveVehicle',  vid => socket.leave(`vehicle_${vid}`));
});

// **Muito importante**: disponibilizar o `io` a todas as rotas
app.set('io', io);

// Registo de rotas
app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Rota de teste
app.get('/', (_, res) => res.json({ message: 'Backend a funcionar' }));

// Arranca o servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});
