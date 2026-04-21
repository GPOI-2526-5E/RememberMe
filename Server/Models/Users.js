const mongoose = require('mongoose');

const User = new mongoose.Schema({
  username: String,
  email: String,
  pswHash: String,
  createdBy: String,
  assignedDeceased: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deceased'
    }],
  municipalityId: String,
});

module.exports = mongoose.model('User', User, 'Users');