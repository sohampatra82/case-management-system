const express = require("express");
const router = express.Router();
const NewCaseModel = require("../../models/NewCase.model");
const auth = require("../../middleware/auth");

const ensureBranchUser = (req, res, next) => {
  if (
    !req.session.user ||
    req.session.user.role !== "branch" ||
    !req.session.user.branch
  ) {
    return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
  }
  next();
};

router.get("/", auth("branch"), ensureBranchUser, (req, res) => {
  res.render("BranchCase", {
    currentUser: req.session.user
  });
});

router.get("/data", auth("branch"), ensureBranchUser, async (req, res) => {
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


router.get("/view/:id", auth("branch"), ensureBranchUser, async (req, res) => {
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

// PATCH - Update Only Remarks (branch + Admin allowed)
router.patch("/:id/remarks",  auth("branch") ,  ensureBranchUser, async (req, res) => {
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