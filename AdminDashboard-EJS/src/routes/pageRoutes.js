const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { guest } = require('../middlewares/guestMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const User = require('../models/User');

router.get('/', (req, res) => res.redirect('/login'));

router.get('/login', guest, (req, res) =>
  res.render('auth/login', {
    user: req.user,
    showSidebar: false,
    expired: req.query.expired,
    invalid: req.query.invalid
  })
);

router.get('/register', guest, (req, res) =>
  res.render('auth/register', { user: req.user, showSidebar: false })
);

router.get('/forgot-password', guest, (req, res) =>
  res.render('auth/forgot-password', {
    user: req.user,
    showSidebar: false,
    error: null,
    success: null,
    resetUrl: null
  })
);

router.get('/reset-password/:token', guest, (req, res) =>
  res.render('auth/reset-password', { user: req.user, showSidebar: false, token: req.params.token })
);

router.get('/dashboard', protect, authorizeRoles('user', 'admin'), (req, res) =>
  res.render('dashboard', { user: req.user, showSidebar: true })
);

router.get('/users', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const limit = 2;

    const users = await User.find()
      .sort({ _id: 1 })
      .limit(limit + 1);

    const hasNextPage = users.length > limit;
    if (hasNextPage) users.pop();

    res.render('users', {
      user: req.user,
      users,
      hasNextPage, 
      showSidebar: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/settings', protect, authorizeRoles('user', 'admin'), (req, res) =>
  res.render('settings', { user: req.user, showSidebar: true })
);

router.get('/activity-logs', protect, authorizeRoles('admin'), (req, res) =>
  res.render('activityLogs', { user: req.user, showSidebar: true })
);

router.get('/logout', protect, (req, res) => {
  res.clearCookie('token');
  res.redirect('/login?success=Logged out successfully');
});

module.exports = router;
