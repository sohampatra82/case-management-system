module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/");
    }

    const userRole = String(req.session.user.role || "").toLowerCase();

    if (!roles.includes(userRole)) {
      return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }

    next();
  };
};
