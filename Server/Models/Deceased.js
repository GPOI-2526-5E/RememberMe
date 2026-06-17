const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
  id: String,
  deceasedId: String,
  author: String,
  message: String,
  date: Date,
  type: {
    type: String,
    enum: ['memory', 'message', 'prayer'],
    default: 'memory'
  }
}, { _id: false });

const Deceased = new mongoose.Schema({
  fullName: String,
  birthDate: Date,
  deathDate: Date,
  biography: String,
  story: String,
  isFamous: Boolean,
  graveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tombstone'
  },
  deceasedImage: String,
  images: [String],
  memories: [MemorySchema],
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('Deceased', Deceased, 'Deceased');