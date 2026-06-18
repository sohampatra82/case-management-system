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
  res.render("BranchReports", {
    currentUser: req.session.user
  });
});

// DATA API FOR CHARTS
router.get("/data", ensureBranchUser, async (req, res) => {
  try {
    const branchId = req.session.user.branch;

    if (!branchId) {
      return res.status(401).json({ error: "Branch ID not found in session" });
    }

    const cases = await NewCaseModel.find({
      branch: branchId
    })
      .populate("bank", "bankName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .populate("zone", "zoneName")
      .lean();

    const formatted = cases.map(c => ({
      zone: c.zone?.zoneName || "-",
      region: c.region?.regionName || "-",
      branch: c.branch?.branchName || "-",
      bank: c.bank?.bankName || "-",
      currentStage: c.currentStage || "ALLOTMENT"
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

router.get("/download/csv", async (req, res) => {
  try {
    const zoneId = req.session?.user?.zone;
    if (!zoneId) return res.status(401).send("Unauthorized");

    const cases = await NewCaseModel.find({ zone: zoneId })
      .populate("zone", "zoneName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .lean();

    let csv = "Zone,Region,Branch,Case Number,Borrower Name,Stage\n";

    cases.forEach(c => {
      csv += `"${c.zone?.zoneName || ''}","${c.region?.regionName || ''}","${c.branch?.branchName || ''}","${c.caseNumber || ''}","${c.borrowerName || ''}","${c.currentStage || ''}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=branch-report-${new Date().toISOString().slice(0,10)}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating CSV");
  }
});

module.exports = router;