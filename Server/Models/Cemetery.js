const mongoose = require('mongoose');

const Cemetery = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'real' },
  location: {
    address: String,
    city: String,
    country: String,
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  description: String,
  image: String,
  municipalityId: String,
});

// Aggiungi indice geo-spaziale per le query di prossimità
Cemetery.index({ location: '2dsphere' });

module.exports = mongoose.model('Cemetery', Cemetery, "Cemeteries");