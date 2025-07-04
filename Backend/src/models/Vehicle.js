import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  plate:  { type: String, required: true, unique: true, trim: true },
  model:  { type: String, trim: true },
  owner:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
