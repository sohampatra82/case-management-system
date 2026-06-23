// src/routes/Admindashboard.routes.js
const express = require("express");
const router = express.Router();
const NewCaseModel = require("../models/NewCase.model");
const auth = require("../middleware/auth");

const ensureAdminUser = (req, res, next) => {
    if (!req.session?.user || 
        String(req.session.user.role || "").toLowerCase() !== "admin"
        ) {
        return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }
    next();
};

router.get("/", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const totalCases = await NewCaseModel.countDocuments();

    const pendingCases = await NewCaseModel.countDocuments({
      currentStage: { $nin: ["Completed", "Sale Completed", "Close"] }
    });

    const completedCases = await NewCaseModel.countDocuments({
      currentStage: { $in: ["Completed", "Sale Completed", "Close"] }
    });

    const salesCompleted = await NewCaseModel.countDocuments({
      currentStage: "Sale Completed"
    });

    // Possession Taken
    const possessionTaken = await NewCaseModel.countDocuments({
      possessionDate: { $exists: true, $ne: null }
    });

    // Upcoming Hearings (Fixed + Safe)
   
const upcomingHearings = await NewCaseModel.find({
    hearingDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
})
    .populate("bank", "bankName")
    .select("borrowerName currentStage hearingDate court bank")   // Explicitly select needed fields
    .sort({ hearingDate: 1 })
    .lean();

    // Recent Activity
    const recentActivity = await NewCaseModel.find({})
      .populate("bank", "bankName")
      .populate("zone", "zoneName")
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean();

    // Stage Wise
    const stageWise = await NewCaseModel.aggregate([
      { $group: { _id: "$currentStage", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Zone Wise (Fixed)
    const zoneWise = await NewCaseModel.aggregate([
      {
        $lookup: {
          from: "zones",
          localField: "zone",
          foreignField: "_id",
          as: "zoneInfo"
        }
      },
      { $unwind: { path: "$zoneInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$zoneInfo.zoneName", "Unknown"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.render("adminDashboard", {
      totalCases,
      pendingCases,
      completedCases,
      possessionTaken,
      salesCompleted,
      upcomingHearings: upcomingHearings || [],
      recentActivity: recentActivity || [],
      stageWise: stageWise || [],
      zoneWise: zoneWise || []
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).send("Server Error: " + error.message);
  }
});

module.exports = router;
