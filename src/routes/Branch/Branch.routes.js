const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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

router.get("/", ensureBranchUser, async (req, res) => {
  try {
    const userBranchId = req.session.user.branch;

    // ==================== COUNTS ====================
    const totalCases = await NewCaseModel.countDocuments({
      branch: userBranchId
    });

    const pendingCases = await NewCaseModel.countDocuments({
      branch: userBranchId,
      currentStage: { $nin: ["Completed", "Sale Completed", "Close"] }
    });

    const completedCases = await NewCaseModel.countDocuments({
      branch: userBranchId,
      currentStage: { $in: ["Completed", "Sale Completed", "Close"] }
    });

    const salesCompleted = await NewCaseModel.countDocuments({
      branch: userBranchId,
      currentStage: "Sale Completed"
    });

    const possessionTaken = await NewCaseModel.countDocuments({
      branch: userBranchId,
      possessionDate: { $exists: true, $ne: null }
    });

    // ==================== UPCOMING HEARINGS ====================
    const upcomingHearings = await NewCaseModel.find({
      branch: userBranchId,
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
    const recentActivity = await NewCaseModel.find({ branch: userBranchId })
      .populate("bank", "bankName")
      .populate("region", "regionName")
      .populate("branch", "branchName")
      .populate("zone", "zoneName")
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean();

    // ==================== STAGE WISE ====================
    const stageWise = await NewCaseModel.aggregate([
      { $match: { branch: new mongoose.Types.ObjectId(userBranchId) } },
      { $group: { _id: "$currentStage", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // ==================== ZONE WISE (Right Side) ====================
    const zoneWise = await NewCaseModel.aggregate([
      { $match: { branch: new mongoose.Types.ObjectId(userBranchId) } },
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
      },
      { $sort: { count: -1 } }
    ]);

    res.render("BranchDashboard", {
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
    console.error("🔥 Branch Dashboard Error:", error);
    res
      .status(500)
      .send(`<h2 style="color:red;padding:20px;">Error: ${error.message}</h2>`);
  }
});

module.exports = router;
