const mongoose = require('mongoose');

const Municipality = new mongoose.Schema({
  name: String,
  address: String,
  contactEmail: String,
  phone: String,
});

module.exports = mongoose.model('Mun icipality', Municipality, 'Municipalities');