const mongoose = require('mongoose');

const deceasedSchema = new mongoose.Schema({
  name: String,
  tombId: String,
  lat: Number,
  lng: Number,
  birth: String,
  death: String,
  description: String
});

const cemeterySchema = new mongoose.Schema({
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
  deceased: [deceasedSchema]
});

// Aggiungi indice geo-spaziale per le query di prossimità
cemeterySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Cemetery', cemeterySchema, 'Cemeteries');