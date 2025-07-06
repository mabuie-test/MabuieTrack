import Command from '../models/Command.js';
import Vehicle from '../models/Vehicle.js';

export async function createEngineKillCommand(req, res) {
  const { id: vehicleId } = req.params;
  const v = await Vehicle.findById(vehicleId);
  if (!v) return res.status(404).json({ message: 'Veículo não encontrado' });
  const cmd = await Command.create({
    vehicleId,
    type: 'engine-kill',
    to:   v.devicePhone,
    message: 'CMD:KILL_ENGINE'
  });
  // emitir evento socket.io
  req.app.get('io').to(`vehicle_${vehicleId}`)
     .emit('engineStatus',{ vehicleId, status:'disabled' });
  res.status(201).json({ message:'Corte enfileirado', cmd });
}

export async function createEngineEnableCommand(req, res) {
  const { id: vehicleId } = req.params;
  const v = await Vehicle.findById(vehicleId);
  if (!v) return res.status(404).json({ message: 'Veículo não encontrado' });
  const cmd = await Command.create({
    vehicleId,
    type: 'engine-enable',
    to:   v.devicePhone,
    message: 'CMD:ENABLE_ENGINE'
  });
  req.app.get('io').to(`vehicle_${vehicleId}`)
     .emit('engineStatus',{ vehicleId, status:'enabled' });
  res.status(201).json({ message:'Habilitação enfileirada', cmd });
}

export async function listPendingCommands(req, res) {
  const { id: vehicleId } = req.params;
  const cmds = await Command.find({ vehicleId, executed: false }).sort('issuedAt');
  res.json(cmds);
}

export async function acknowledgeCommand(req, res) {
  const { cmdId } = req.params;
  const cmd = await Command.findByIdAndUpdate(
    cmdId, { executed:true, executedAt:new Date() }, { new:true }
  );
  if (!cmd) return res.sendStatus(404);
  res.json({ message:'Executado', cmd });
}
