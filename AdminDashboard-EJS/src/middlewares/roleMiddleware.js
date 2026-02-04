exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.redirect('/login');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).render('errors/403', {
        user: req.user,
        showSidebar: false,
        message: 'You do not have permission to access this page'
      });
    }

    next();
  };
};
