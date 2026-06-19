const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const NewCaseModel = require("../../models/NewCase.model");

const ensureRegionalUser = (req, res, next) => {
    if (!req.session?.user) return res.status(403).send("Access Denied");
    
    const role = String(req.session.user.role || "").toLowerCase();
    if (role !== "regional") return res.status(403).send("Access Denied");
    if (!req.session.user.region) return res.status(403).send("Region not assigned");

    next();
};

router.get("/", ensureRegionalUser, async (req, res) => {
    try {
        const userRegionId = req.session.user.region;

        // ==================== COUNTS ====================
        const totalCases = await NewCaseModel.countDocuments({ region: userRegionId });
        const pendingCases = await NewCaseModel.countDocuments({
            region: userRegionId,
            currentStage: { $nin: ["Completed", "Sale Completed", "Close"] }
        });
        const completedCases = await NewCaseModel.countDocuments({
            region: userRegionId,
            currentStage: { $in: ["Completed", "Sale Completed", "Close"] }
        });
        const salesCompleted = await NewCaseModel.countDocuments({
            region: userRegionId,
            currentStage: "Sale Completed"
        });
        const possessionTaken = await NewCaseModel.countDocuments({
            region: userRegionId,
            possessionDate: { $exists: true, $ne: null }
        });

        // Upcoming Hearings
        const upcomingHearings = await NewCaseModel.find({
            region: userRegionId,
            hearingDate: { $gte: new Date(), $lte: new Date(Date.now() + 30*24*60*60*1000) }
        })
        .populate("bank", "bankName")
        .populate("branch", "branchName")
        .populate("zone", "zoneName")
        .sort({ hearingDate: 1 })
        .lean();

        // Recent Activity
        const recentActivity = await NewCaseModel.find({ region: userRegionId })
            .populate("bank", "bankName")
            .populate("branch", "branchName")
            .populate("zone", "zoneName")
            .sort({ updatedAt: -1 })
            .limit(8)
            .lean();

        // Stage Wise
        const stageWise = await NewCaseModel.aggregate([
            { $match: { region: new mongoose.Types.ObjectId(userRegionId) } },
            { $group: { _id: "$currentStage", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // ==================== ZONE WISE (Right Side - as requested) ====================
        const zoneWise = await NewCaseModel.aggregate([
            { $match: { region: new mongoose.Types.ObjectId(userRegionId) } },
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

        res.render("RegionalDashboard", {
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
        console.error("🔥 Regional Dashboard Error:", error);
        res.status(500).send(`<h2 style="color:red;padding:20px;">Error: ${error.message}</h2>`);
    }
});

module.exports = router;