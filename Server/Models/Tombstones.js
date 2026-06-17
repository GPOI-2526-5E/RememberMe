const mongoose = require('mongoose');

const Tombstone = new mongoose.Schema({
  cemeteryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cemetery'
  },
  section: String,
  plotNumber: String,
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  status: String,
});

module.exports = mongoose.model('Tombstone', Tombstone, 'Tombstones');