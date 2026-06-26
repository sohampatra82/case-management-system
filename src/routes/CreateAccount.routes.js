const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");


const ensureAdminUser = (req, res, next) => {
    if (!req.session?.user || 
        String(req.session.user.role || "").toLowerCase() !== "admin"
        ) {
        return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }
    next();
};;



router.get("/", auth("admin"), ensureAdminUser, (req, res) => {
  res.render("createAccount");
});


module.exports = router;