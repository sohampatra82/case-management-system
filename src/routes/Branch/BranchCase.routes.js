const express = require("express");
const router = express.Router();
const NewCaseModel = require("../../models/NewCase.model");

const ensureBranchUser = (req, res, next) => {
  if (
    !req.session.user ||
    req.session.user.role !== "branch" ||
    !req.session.user.branch
  ) {
    return res.status(403).send("Access Denied");
  }
  next();
};

router.get("/", ensureBranchUser, (req, res) => {
  res.render("BranchCase", {
    currentUser: req.session.user
  });
});

router.get("/data", ensureBranchUser, async (req, res) => {
  try {
    const branchId = req.session.user.branch;

    const cases = await NewCaseModel.find({
      branch: branchId
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


router.get("/view/:id", ensureBranchUser, async (req, res) => {
  try {
    const caseId = req.params.id;
    const branchId = req.session.user.branch; // Assuming branch is the correct field for branch users

    const caseData = await NewCaseModel.findOne({
      _id: caseId,
      branch: branchId
    })
      .populate("bank", "bankName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .populate("zone", "zoneName")
      .lean();

    if (!caseData) {
      return res.status(404).send("Case not found or access denied");
    }

    res.render("BranchCaseView", { 
      caseData,
      currentUser: req.session.user 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;