import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema({
  lat:    Number,
  lng:    Number,
  speed:  Number,
  baterry:    Number,
  at:     { type: Date, default: Date.now }
}, { _id: false });

const vehicleSchema = new mongoose.Schema({
  plate:     { type: String, required: true, unique: true, trim: true },
  model:     { type: String, trim: true },
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  telemetry: [telemetrySchema]
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
