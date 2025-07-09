import dotenv from 'dotenv';
import http    from 'http';
import app     from './app.js';
import { Server as IOServer } from 'socket.io';
dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

export const io = new IOServer(server, {
  cors: { origin: '*' }
});
io.on('connection', socket => {
  console.log('👤 Cliente Socket conectado:', socket.id);
  socket.on('joinVehicle', id => socket.join(`vehicle_${id}`));
  socket.on('leaveVehicle', id => socket.leave(`vehicle_${id}`));
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});
