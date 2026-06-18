const express = require("express");
const router = express.Router();
const NewCaseModel = require("../../models/NewCase.model");

const ensureZonalUser = (req, res, next) => {
  if (
    !req.session.user ||
    req.session.user.role !== "zonal" ||
    !req.session.user.zone
  ) {
    return res.status(403).send("Access Denied");
  }
  next();
};

router.get("/", ensureZonalUser, (req, res) => {
  res.render("ZonalCase", {
    currentUser: req.session.user
  });
});

router.get("/data", ensureZonalUser, async (req, res) => {
  try {
    const zoneId = req.session.user.zone;

    const cases = await NewCaseModel.find({
      zone: zoneId
    })
      .populate("bank", "bankName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .sort({ createdAt: -1 })
      .lean();

    const formattedCases = cases.map(c => ({
      ...c,
      bank: c.bank?.bankName || "N/A",
      region: c.region?.regionName || "N/A",
      branch: c.branch?.branchName || "N/A",
      borrower: c.borrowerName || "N/A",
      stage: c.currentStage || "ALLOTMENT"
    }));

    res.json(formattedCases);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// Add this before module.exports = router;

router.get("/view/:id", ensureZonalUser, async (req, res) => {
  try {
    const caseId = req.params.id;
    const zoneId = req.session.user.zone;

    const caseData = await NewCaseModel.findOne({
      _id: caseId,
      zone: zoneId
    })
      .populate("bank", "bankName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .populate("zone", "zoneName")
      .lean();

    if (!caseData) {
      return res.status(404).send("Case not found or access denied");
    }

    res.render("ZonalCaseView", { 
      caseData,
      currentUser: req.session.user 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
module.exports = router;