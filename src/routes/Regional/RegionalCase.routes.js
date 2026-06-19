const express = require("express");
const router = express.Router();
const NewCaseModel = require("../../models/NewCase.model");

const ensureRegionalUser = (req, res, next) => {
    if (!req.session?.user || 
        String(req.session.user.role || "").toLowerCase() !== "regional" || 
        !req.session.user.region) {
        return res.status(403).send("Access Denied");
    }
    next();
};

router.get("/", ensureRegionalUser, (req, res) => {
    res.render("RegionalCase", {
        currentUser: req.session.user
    });
});

router.get("/data", ensureRegionalUser, async (req, res) => {
    try {
        const regionId = req.session.user.region;

        const cases = await NewCaseModel.find({
            region: regionId
        })
            .populate("bank", "bankName")
            .populate("branch", "branchName")
            .sort({ createdAt: -1 })
            .lean();

        const formattedCases = cases.map((c, i) => ({
            ...c,
            si: i + 1,
            bank: c.bank?.bankName || "N/A",
            branch: c.branch?.branchName || "N/A",
            borrower: c.borrowerName || c.accountName || "N/A",
            stage: c.currentStage || "ALLOTMENT"
        }));

        res.json(formattedCases);
    } catch (err) {
        console.error("Regional Case Data Error:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


router.get("/view/:id", ensureRegionalUser, async (req, res) => {
  try {
    const caseId = req.params.id;
    const regionId = req.session.user.region; // Assuming region is the correct field for regional users

    const caseData = await NewCaseModel.findOne({
      _id: caseId,
      region: regionId
    })
      .populate("bank", "bankName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .populate("zone", "zoneName")
      .lean();

    if (!caseData) {
      return res.status(404).send("Case not found or access denied");
    }

    res.render("RegionalCaseView", { 
      caseData,
      currentUser: req.session.user 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;