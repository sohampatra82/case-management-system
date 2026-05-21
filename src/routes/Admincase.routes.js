// routes/Admincase.routes.js
const express = require("express");
const router = express.Router();
const NewCaseModel = require("../models/NewCase.model");

router.get("/", (req, res) => {
  res.render("adminCase"); // Make sure adminCase.ejs exists
});

router.get("/data", async (req, res) => {
  try {
    const cases = await NewCaseModel.find({}).sort({ createdAt: -1 }).lean();

    // console.log(`✅ Fetched ${cases.length} cases`); // For debugging

    res.json(cases);
  } catch (error) {
    console.error("❌ Error fetching cases:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
