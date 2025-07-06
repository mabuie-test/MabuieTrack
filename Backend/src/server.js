import dotenv from 'dotenv';
import http    from 'http';
import app     from './app.js';
import { Server as IOServer } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Configura Socket.IO e guarda em app para controllers acessarem
const io = new IOServer(server, { cors: { origin: '*' } });
app.set('io', io);

io.on('connection', socket => {
  console.log('👤 Cliente Socket conectado:', socket.id);
  socket.on('joinVehicle', vehicleId => {
    socket.join(`vehicle_${vehicleId}`);
  });
  socket.on('leaveVehicle', vehicleId => {
    socket.leave(`vehicle_${vehicleId}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor backend a correr na porta ${PORT}`);
});
