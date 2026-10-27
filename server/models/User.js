const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minlength: 2,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  niche: {
    type: String,
    default: 'Lifestyle'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
