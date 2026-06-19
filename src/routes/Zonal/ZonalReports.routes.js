const express = require("express");
const router = express.Router();
const NewCaseModel = require("../../models/NewCase.model");
const auth = require("../../middleware/auth");


const ensureZonalUser = (req, res, next) => {
  if (
    !req.session.user ||
    req.session.user.role !== "zonal" ||
    !req.session.user.zone
  ) {
    return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
  }
  next();
};

router.get("/", auth("zonal"), ensureZonalUser, (req, res) => {
  res.render("ZonalReports");
});

// DATA API FOR CHART
router.get("/data", auth("zonal"), ensureZonalUser, async (req, res) => {
  console.log("SESSION:", req.session);

  try {
    const zoneId = req.session?.user?.zone;

    if (!zoneId) {
      return res.status(401).json({
        error: "User session or zone not found"
      });
    }

   const cases = await NewCaseModel.find({
  zone: zoneId
})
.populate("zone", "zoneName")
.populate("region", "regionName")
.populate("branch", "branchName")
.lean();

   const formatted = cases.map(c => ({
  zone: c.zone?.zoneName || "-",
  region: c.region?.regionName || "-",
  branch: c.branch?.branchName || "-",
  currentStage: c.currentStage || "-"
}));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});


router.get("/download/csv", auth("zonal"), ensureZonalUser, async (req, res) => {
  try {
    const zoneId = req.session?.user?.zone;
    if (!zoneId) return res.status(401).send("Unauthorized");

    const cases = await NewCaseModel.find({ zone: zoneId })
      .populate("zone", "zoneName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .lean();

    // Simple CSV generation
    let csv = "Zone,Region,Branch,Case Number,Borrower Name,Stage\n";

    cases.forEach(c => {
      csv += `"${c.zone?.zoneName || ''}","${c.region?.regionName || ''}","${c.branch?.branchName || ''}","${c.caseNumber || ''}","${c.borrowerName || ''}","${c.currentStage || ''}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=zonal-report.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating CSV");
  }
});

module.exports = router;