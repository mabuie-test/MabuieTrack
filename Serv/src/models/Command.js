import mongoose from 'mongoose';
const commandSchema = new mongoose.Schema({
  vehicleId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  type:       { type: String, enum: ['sms','engine-kill','engine-enable'], required: true },
  to:         { type: String, required: true },
  message:    { type: String, default: '' },
  issuedAt:   { type: Date, default: Date.now },
  executed:   { type: Boolean, default: false },
  executedAt: { type: Date, default: null }
});
export default mongoose.models.Command || mongoose.model('Command', commandSchema);
