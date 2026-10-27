const mongoose = require('mongoose');

const followerRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  count: {
    type: Number,
    min: 1,
    required: true
  },
  month: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('FollowerRecord', followerRecordSchema);
