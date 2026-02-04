const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.redirect('/login');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {

      res.clearCookie('token');

      if (err.name === 'TokenExpiredError') {
        return res.redirect('/login?expired=1');
      }

      return res.redirect('/login?invalid=1');
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.clearCookie('token');
      return res.redirect('/login?invalid=1');
    }

    req.user = user;
    res.locals.user = user;
    next();

  } catch (err) {
    console.error('Protect middleware error:', err);
    res.clearCookie('token');
    return res.redirect('/login');
  }
};
