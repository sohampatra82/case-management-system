const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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

router.get("/",  auth("zonal"), ensureZonalUser, (req, res) => {
  res.render("ZonalCase", {
    currentUser: req.session.user
  });
});

router.get("/data",  auth("zonal"), ensureZonalUser, async (req, res) => {
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

router.get("/view/:id", auth("zonal"), ensureZonalUser, async (req, res) => {
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


// PATCH - Update Only Remarks (Zonal + Admin allowed)
router.patch("/:id/remarks",  auth("zonal") ,  ensureZonalUser, async (req, res) => {
    try {
        const { initialRemarks } = req.body;
        const caseId = req.params.id;

        const caseData = await NewCaseModel.findById(caseId);
        if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

        // Optional: Restrict to user's zone
        if (caseData.zone.toString() !== req.session.user.zone.toString()) {
            return res.status(403).json({ success: false, message: "Access Denied" });
        }

        // Push to history before updating
        if (caseData.initialRemarks && caseData.initialRemarks !== initialRemarks) {
            caseData.remarksHistory.push({
                remark: caseData.initialRemarks,
                date: new Date(),
                updatedBy: req.session.user.fullName || req.session.user.username
            });
        }

        caseData.initialRemarks = initialRemarks || "";
        await caseData.save();

        res.json({ 
            success: true, 
            message: "Remarks updated successfully",
            initialRemarks: caseData.initialRemarks 
        });
    } catch (error) {
        console.error("Update Remarks Error:", error);
        res.status(500).json({ success: false, message: "Failed to update remarks" });
    }
});


module.exports = router;