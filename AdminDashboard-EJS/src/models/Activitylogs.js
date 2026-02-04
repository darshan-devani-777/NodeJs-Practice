const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ip: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
