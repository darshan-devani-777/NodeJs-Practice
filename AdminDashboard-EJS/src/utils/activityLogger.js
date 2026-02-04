const ActivityLog = require('../models/Activitylogs');

const logActivity = async ({
  user = null,
  action,
  description,
  req,
  status = 'success'
}) => {
  try {
    await ActivityLog.create({
      user,
      action,
      description,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status
    });
  } catch (err) {
    console.error('❌ Activity log failed:', err.message);
  }
};

module.exports = logActivity;
