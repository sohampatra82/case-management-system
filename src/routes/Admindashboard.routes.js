const express = require("express");
const router = express.Router();

const NewCaseModel = require("../models/NewCase.model");

// GET Admin Dashboard
router.get("/", async (req, res) => {
  try {
    // Basic Counts
    const totalCases = await NewCaseModel.countDocuments();

    const pendingCases = await NewCaseModel.countDocuments({
      currentStage: { $nin: ["Completed", "Sale Completed"] }
    });

    const completedCases = await NewCaseModel.countDocuments({
      currentStage: { $in: ["Completed", "Sale Completed"] }
    });

    const possessionTaken = await NewCaseModel.countDocuments({
      possessionDate: { $exists: true, $ne: null }
    });

    const salesCompleted = await NewCaseModel.countDocuments({
      currentStage: "Sale Completed"
    });

    // Upcoming Hearings
    const upcomingHearings = await NewCaseModel.find({
      hearingDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
      .sort({ hearingDate: 1 })
      .lean();

    // Recent Activity
    const recentActivity = await NewCaseModel.find({})
      .sort({ updatedAt: -1 })
      .limit(8)
      .select("accountName bank zone currentStage updatedAt")
      .lean();

    // Stage Wise
    const stageWise = await NewCaseModel.aggregate([
      { $group: { _id: "$currentStage", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Zone Wise
    const zoneWise = await NewCaseModel.aggregate([
      { $group: { _id: "$zone", count: { $sum: 1 } } }
    ]);

    res.render("adminDashboard", {
      totalCases,
      pendingCases,
      completedCases,
      possessionTaken,
      salesCompleted,
      upcomingHearings,
      recentActivity,
      stageWise,
      zoneWise
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).send("Server Error: " + error.message);
  }
});

module.exports = router;
