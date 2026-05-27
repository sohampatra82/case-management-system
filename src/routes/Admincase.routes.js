const express = require("express");
const router = express.Router();
const NewCaseModel = require("../models/NewCase.model");

router.get("/", (req, res) => {
  res.render("adminCase");
});

router.get("/data", async (req, res) => {
  try {
    const cases = await NewCaseModel.find({})
      .populate("bank", "bankName")
      .populate("zone", "zoneName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .sort({ createdAt: -1 })
      .lean();

    const formattedCases = cases.map(c => ({
      ...c,
      bank: c.bank?.bankName || c.bank || "N/A",
      zone: c.zone?.zoneName || c.zone || "N/A",
      region: c.region?.regionName || c.region || "N/A",
      branch: c.branch?.branchName || c.branch || "N/A",
      borrower: c.borrowerName || "N/A",
      stage: c.currentStage || "ALLOTMENT"
    }));

    res.json(formattedCases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;