const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deviceId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
