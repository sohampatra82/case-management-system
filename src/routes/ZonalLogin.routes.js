const express = require("express");
const router = express.Router();




router.get("/", (req, res) => {
  res.render("zonalLogin");
});

module.exports = router;