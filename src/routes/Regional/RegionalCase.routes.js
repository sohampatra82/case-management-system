const express = require("express");
const router = express.Router();
const NewCaseModel = require("../../models/NewCase.model");
const auth = require("../../middleware/auth");

const ensureRegionalUser = (req, res, next) => {
    if (!req.session?.user || 
        String(req.session.user.role || "").toLowerCase() !== "regional" || 
        !req.session.user.region) {
        return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }
    next();
};

router.get("/", auth("regional"), ensureRegionalUser, (req, res) => {
    res.render("RegionalCase", {
        currentUser: req.session.user
    });
});

router.get("/data", auth("regional"), ensureRegionalUser, async (req, res) => {
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


router.get("/view/:id", auth("regional"), ensureRegionalUser, async (req, res) => {
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


// PATCH - Update Only Remarks (regional + Admin allowed)
router.patch("/:id/remarks",  auth("regional") ,  ensureRegionalUser, async (req, res) => {
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