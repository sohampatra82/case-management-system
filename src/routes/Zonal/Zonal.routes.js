const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const NewCaseModel = require("../../models/NewCase.model");

const ensureZonalUser = (req, res, next) => {
  if (
    !req.session.user ||
    req.session.user.role !== "zonal" ||
    !req.session.user.zone
  ) {
    return res.status(403).send("Access Denied");
  }
  next();
};

router.get("/", ensureZonalUser, async (req, res) => {
  try {
    const userZoneId = req.session.user.zone;

    // ==================== COUNTS ====================
    const totalCases = await NewCaseModel.countDocuments({ zone: userZoneId });

    const pendingCases = await NewCaseModel.countDocuments({
      zone: userZoneId,
      currentStage: { $nin: ["Completed", "Sale Completed", "Close"] }
    });

    const completedCases = await NewCaseModel.countDocuments({
      zone: userZoneId,
      currentStage: { $in: ["Completed", "Sale Completed", "Close"] }
    });

    const salesCompleted = await NewCaseModel.countDocuments({
      zone: userZoneId,
      currentStage: "Sale Completed"
    });

    const possessionTaken = await NewCaseModel.countDocuments({
      zone: userZoneId,
      possessionDate: { $exists: true, $ne: null }
    });

    // ==================== UPCOMING HEARINGS ====================
    const upcomingHearings = await NewCaseModel.find({
      zone: userZoneId,
      hearingDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
      .populate("bank", "bankName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .populate("zone", "zoneName")
      .sort({ hearingDate: 1 })
      .lean();

    // ==================== RECENT ACTIVITY ====================
    const recentActivity = await NewCaseModel.find({ zone: userZoneId })
      .populate("bank", "bankName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .populate("zone", "zoneName")
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean();

    // ==================== STAGE WISE ====================
    const stageWise = await NewCaseModel.aggregate([
      { $match: { zone: new mongoose.Types.ObjectId(userZoneId) } },
      { $group: { _id: "$currentStage", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // ==================== ZONE WISE (Right Side Chart) ====================
    const zoneWise = await NewCaseModel.aggregate([
      { $match: { zone: new mongoose.Types.ObjectId(userZoneId) } },
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
          _id: "$zoneInfo.zoneName" || "Unknown",
          count: { $sum: 1 }
        }
      }
    ]);

    res.render("zonalDashboard", {
      totalCases,
      pendingCases,
      completedCases,
      possessionTaken,
      salesCompleted,
      upcomingHearings: upcomingHearings || [],
      recentActivity: recentActivity || [],
      stageWise: stageWise || [],
      zoneWise: zoneWise || [],
      currentUser: req.session.user
    });
  } catch (error) {
    console.error("Zonal Dashboard Error:", error);
    res.status(500).send("Server Error: " + error.message);
  }
});

module.exports = router;
