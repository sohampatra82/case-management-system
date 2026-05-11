const express = require("express");
const router = express.Router();
const NewCaseModel = require("../models/NewCase.model");



router.get("/", (req, res) => {
  res.render("adminCase");
});


// GET ALL CASES
router.get("/data", async (req, res) => {
  try {
    const cases = await NewCaseModel.find({})
      .sort({ createdAt: -1 })   // Newest first
      .lean();                   // Better performance

    // console.log(`✅ Fetched ${cases.length} cases`);

    res.json(cases);
  } catch (error) {
    console.error("❌ Error fetching cases:", error);
    res.status(500).json({ message: "Server Error" });
  }
});




module.exports = router;