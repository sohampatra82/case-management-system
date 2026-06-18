const express = require("express");
const router = express.Router();
const NewCaseModel = require("../../models/NewCase.model");

router.get("/", (req, res) => {
  res.render("RegionalReports");
});

// DATA API FOR CHART
router.get("/data", async (req, res) => {
  try {
    const regionId = req.session?.user?.region;
    if (!regionId) {
      return res.status(401).json({
        error: "User session or region not found"
      });
    }

    const cases = await NewCaseModel.find({
      region: regionId
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

// CSV Download (you can implement this similarly to zonal)


router.get("/download/csv", async (req, res) => {
  try {
    const zoneId = req.session?.user?.zone;
    if (!zoneId) return res.status(401).send("Unauthorized");

    const cases = await NewCaseModel.find({ zone: zoneId })
      .populate("zone", "zoneName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .lean();

    let csv = "Zone,Region,Case Number,Borrower Name,Stage,Branch\n";

    cases.forEach(c => {
      csv += `"${c.zone?.zoneName || ''}","${c.region?.regionName || ''}","${c.caseNumber || ''}","${c.borrowerName || ''}","${c.currentStage || ''}","${c.branch?.branchName || ''}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=regional-report-${new Date().toISOString().slice(0,10)}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating CSV");
  }
});



module.exports = router;