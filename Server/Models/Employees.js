const mongoose = require('mongoose');

const Employee = new mongoose.Schema({
  fullName: String,
  email: String,
  pswHash: String,
  municipalityId: Boolean,
});

module.exports = mongoose.model('Employee', Employee, 'Employees');