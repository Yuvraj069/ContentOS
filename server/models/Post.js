const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  format: {
    type: String,
    enum: ['Reel', 'Carousel', 'Static'],
    required: true
  },
  topic: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    min: 0,
    default: 0
  },
  comments: {
    type: Number,
    min: 0,
    default: 0
  },
  shares: {
    type: Number,
    min: 0,
    default: 0
  },
  reach: {
    type: Number,
    min: 1,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
