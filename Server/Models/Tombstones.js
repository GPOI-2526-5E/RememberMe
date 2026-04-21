const mongoose = require('mongoose');

const Tombstone = new mongoose.Schema({
  cementeryId: String,
  section: String,
  plotNumber: String,
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
});

module.exports = mongoose.model('Tombstone', Tombstone, 'Tombstones');