// src/server.js
import dotenv from 'dotenv';
import http    from 'http';
import app     from './app.js';
import { Server as IOServer } from 'socket.io';
dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// monta o Socket.IO
const io = new IOServer(server, { cors: { origin: '*' } });
io.on('connection', socket => {
  console.log('👤 Socket conectado:', socket.id);
  socket.on('joinVehicle', id => socket.join(`vehicle_${id}`));
  socket.on('leaveVehicle', id => socket.leave(`vehicle_${id}`));
});

// **Isto é fundamental** para o teu middleware ou as routes acederem ao io
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});
