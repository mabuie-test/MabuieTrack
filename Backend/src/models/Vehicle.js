import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema({
  lat:     Number,
  lng:     Number,
  speed:   Number,
  battery: Number,                     // corrigido
  at:      { type: Date, default: Date.now }
}, { _id: false });

const vehicleSchema = new mongoose.Schema({
  plate:      { type: String, required: true, unique: true, trim: true },
  model:      { type: String, trim: true },
  owner:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  devicePhone:{ type: String, trim: true },
  geofence:   {                         // novo campo GeoJSON Polygon
    type: { type: String, enum: ['Polygon'], default: 'Polygon' },
    coordinates: { type: [[[Number]]], default: [] }
  },
  telemetry:  [telemetrySchema]
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
