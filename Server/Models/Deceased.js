const mongoose = require('mongoose');

const Deceased = new mongoose.Schema({
  fullName: String,
  birthDate: Date,
  deathDate: Date,
  biography: String,
  isFamous: Boolean,
  graveId: String,
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }]
});

module.exports = mongoose.model('Deceased', Deceased, 'Deceaseds');