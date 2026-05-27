const express = require("express");
const router = express.Router();

// Import Models
const AdminModel = require("../models/Admin.model");
const ZonalModel = require("../models/ZonalSignUp.model");
const RegionalModel = require("../models/RegionalSignup.model");
const BranchModel = require("../models/BranchSignup.model");

// ====================== LIST ALL USERS ======================
router.get("/", async (req, res) => {
    try {
        const admins = await AdminModel.find({}).lean();
        const zonals = await ZonalModel.find({}).lean();
        const regionals = await RegionalModel.find({}).lean();
        const branches = await BranchModel.find({}).lean();

        const allUsers = [
            ...admins.map(user => ({
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                role: user.role || "SUPER_ADMIN",
                scope: "All Zones (Global)",
                color: "blue",
                initials: getInitials(user.fullName),
                type: "ADMIN",
                model: "Admin"
            })),
            ...zonals.map(user => ({
                id: user._id,
                fullName: user.fullName,
                username: user.loginId,
                role: "ZONAL",
                scope: `Zone: ${user.zone?.toUpperCase() || 'N/A'}`,
                color: "violet",
                initials: getInitials(user.fullName),
                type: "ZONAL",
                model: "Zonal"
            })),
            ...regionals.map(user => ({
                id: user._id,
                fullName: user.fullName,
                username: user.loginId,
                role: "REGIONAL",
                scope: `Region: ${user.zone?.toUpperCase() || 'N/A'}`,
                color: "emerald",
                initials: getInitials(user.fullName),
                type: "REGIONAL",
                model: "Regional"
            })),
            ...branches.map(user => ({
                id: user._id,
                fullName: user.fullName,
                username: user.loginId,
                role: "BRANCH",
                scope: user.bank ? `Branch: ${user.bank}` : "Branch: N/A",
                color: "amber",
                initials: getInitials(user.fullName),
                type: "BRANCH",
                model: "Branch"
            }))
        ];

        res.render("adminAllUsers", { users: allUsers, totalUsers: allUsers.length });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// ====================== EDIT PAGE ======================
router.get("/edit/:model/:id", async (req, res) => {
    try {
        const { model, id } = req.params;
        let user = null;

        if (model === "Admin") {
            user = await AdminModel.findById(id).lean();
            user.model = "Admin";
        } else if (model === "Zonal") {
            user = await ZonalModel.findById(id).lean();
            user.model = "Zonal";
        } else if (model === "Regional") {
            user = await RegionalModel.findById(id).lean();
            user.model = "Regional";
        } else if (model === "Branch") {
            user = await BranchModel.findById(id).lean();
            user.model = "Branch";
        }

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render("adminEditUser", { user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// ====================== UPDATE USER ======================
router.post("/edit/:model/:id", async (req, res) => {
    try {
        const { model, id } = req.params;
        const { fullName, username, zone, bank } = req.body;

        let updatedUser;

        if (model === "Admin") {
            updatedUser = await AdminModel.findByIdAndUpdate(id, { fullName, username }, { new: true });
        } else if (model === "Zonal" || model === "Regional" || model === "Branch") {
            updatedUser = await (model === "Zonal" ? ZonalModel :
                                model === "Regional" ? RegionalModel : BranchModel)
                .findByIdAndUpdate(id, { fullName, loginId: username?.toUpperCase(), zone, bank }, { new: true });
        }

        if (!updatedUser) return res.status(404).send("User not found");

        res.redirect("/admin-users");
    } catch (error) {
        console.error(error);
        res.status(500).send("Update failed");
    }
});

// ====================== DELETE USER ======================
router.delete("/delete/:model/:id", async (req, res) => {
    try {
        const { model, id } = req.params;
        let result;

        if (model === "Admin") result = await AdminModel.findByIdAndDelete(id);
        else if (model === "Zonal") result = await ZonalModel.findByIdAndDelete(id);
        else if (model === "Regional") result = await RegionalModel.findByIdAndDelete(id);
        else if (model === "Branch") result = await BranchModel.findByIdAndDelete(id);

        if (!result) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
});

function getInitials(name) {
    if (!name) return "NA";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

module.exports = router;