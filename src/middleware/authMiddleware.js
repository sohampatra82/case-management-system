// middlewares/authMiddleware.js
const currentUserMiddleware = (req, res, next) => {
  res.locals.currentUser = req.session.user ||
  req.session.admin || {
    fullName: "SUPER ADMIN",
    role: "SUPER_ADMIN",
    zone: "All Zones"
  };
  next();
};

module.exports = currentUserMiddleware;
