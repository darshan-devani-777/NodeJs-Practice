exports.guest = (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    return res.redirect("/dashboard");
  }
  next();
};
