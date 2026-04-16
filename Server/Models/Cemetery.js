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
  location: String,
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  image: String,
  description: String,
  deceased: [deceasedSchema]
});

module.exports = mongoose.model('Cemetery', cemeterySchema);