const mongoose = require('mongoose');

const Cemetery = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'real' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  address: String,
  city: String,
  country: String,
  description: String,
  image: String,
});

// Aggiungi indice geo-spaziale per le query di prossimità
Cemetery.index({ location: '2dsphere' });

module.exports = mongoose.model('Cemetery', Cemetery, "Cemeteries");