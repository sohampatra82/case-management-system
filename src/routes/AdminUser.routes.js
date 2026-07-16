const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const auth = require("../middleware/auth");

// Import Models
const AdminModel = require("../models/Admin.model");
const ZonalModel = require("../models/ZonalSignUp.model");
const RegionalModel = require("../models/RegionalSignup.model");
const BranchModel = require("../models/BranchSignup.model");
const { Zone, Bank, Region, Branch } = require("../models/MasterData.model");   // ← Added Branch

const ensureAdminUser = (req, res, next) => {
    if (!req.session?.user || String(req.session.user.role || "").toLowerCase() !== "admin") {
        return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }
    next();
};

// ====================== LIST ALL USERS ======================
router.get("/", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const admins = await AdminModel.find({}).lean();
    const zonals = await ZonalModel.find({}).populate("zone", "zoneName").populate("bank", "bankName").lean();
    const regionals = await RegionalModel.find({}).populate("zone", "zoneName").populate("region", "regionName").populate("bank", "bankName").lean();
    const branches = await BranchModel.find({}).populate("bank", "bankName").populate("zone", "zoneName").populate("region", "regionName").populate("branch", "branchName").lean();

    const allUsers = [
      ...admins.map(user => ({ id: user._id, fullName: user.fullName, username: user.username, role: user.role || "SUPER_ADMIN", scope: "All Zones (Global)", color: "blue", initials: getInitials(user.fullName), type: "ADMIN", model: "Admin" })),
      ...zonals.map(user => ({ id: user._id, fullName: user.fullName, username: user.loginId, role: "ZONAL", scope: user.zone ? `Zone: ${user.zone.zoneName}` : "N/A", color: "violet", initials: getInitials(user.fullName), type: "ZONAL", model: "Zonal" })),
      ...regionals.map(user => ({ id: user._id, fullName: user.fullName, username: user.loginId, role: "REGIONAL", scope: user.region ? `Region: ${user.region.regionName}` : "N/A", color: "emerald", initials: getInitials(user.fullName), type: "REGIONAL", model: "Regional" })),
      ...branches.map(user => ({ id: user._id, fullName: user.fullName, username: user.loginId, role: "BRANCH", scope: user.branch ? `Branch: ${user.branch.branchName}` : "Branch: N/A", color: "amber", initials: getInitials(user.fullName), type: "BRANCH", model: "Branch" }))
    ];

    res.render("adminAllUsers", { users: allUsers, totalUsers: allUsers.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server Error");
  }
});

// ====================== DELETE USER ======================
router.delete("/delete/:model/:id", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const { model, id } = req.params;
    let deletedUser = null;

    switch (model) {
      case "Admin": deletedUser = await AdminModel.findByIdAndDelete(id); break;
      case "Zonal": deletedUser = await ZonalModel.findByIdAndDelete(id); break;
      case "Regional": deletedUser = await RegionalModel.findByIdAndDelete(id); break;
      case "Branch": deletedUser = await BranchModel.findByIdAndDelete(id); break;
      default: return res.status(400).json({ success: false, message: "Invalid model type" });
    }

    if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: `${model} user deleted successfully` });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ====================== EDIT PAGE (GET) ======================
router.get("/edit/:model/:id", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const { model, id } = req.params;
    let user = null;
    let banks = [], zones = [], regions = [], branches = [];

    if (model === "Admin") {
      user = await AdminModel.findById(id).lean();
      user.model = "Admin";
    } 
  else if (model === "Zonal") {
  user = await ZonalModel.findById(id)
    .populate("zone", "zoneName")
    .populate("bank", "bankName")
    .lean();
  user.model = "Zonal";

  banks = await Bank.find({ isActive: true }).sort({ bankName: 1 });
  if (user.bank) {
    zones = await Zone.find({ bank: user.bank._id || user.bank, isActive: true });
  }
}
    else if (model === "Regional") {
      user = await RegionalModel.findById(id).populate("region", "regionName").populate("zone", "zoneName").populate("bank", "bankName").lean();
      user.model = "Regional";
      banks = await Bank.find({ isActive: true }).sort({ bankName: 1 });
      if (user.bank) zones = await Zone.find({ bank: user.bank._id, isActive: true });
      if (user.zone) regions = await Region.find({ zone: user.zone._id, isActive: true });
    } 
   else if (model === "Branch") {
  user = await BranchModel.findById(id)
    .populate("bank", "bankName")
    .populate("zone", "zoneName")
    .populate("region", "regionName")
    .populate("branch", "branchName")   // Important: populate 'branch'
    .lean();

  user.model = "Branch";
  banks = await Bank.find({ isActive: true }).sort({ bankName: 1 });

  if (user.region) {
    branches = await Branch.find({ region: user.region._id, isActive: true })
      .sort({ branchName: 1 });
  }
}

    if (!user) return res.status(404).send("User not found");

    res.render("adminEditUser", { user, banks, zones, regions, branches });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// ====================== UPDATE USER ======================
router.post("/edit/:model/:id", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const { model, id } = req.params;
    const { fullName, email, password, username, loginId, ...otherFields } = req.body;

    let Model;
    switch (model) {
      case "Admin": Model = AdminModel; break;
      case "Zonal": Model = ZonalModel; break;
      case "Regional": Model = RegionalModel; break;
      case "Branch": Model = BranchModel; break;
      default: return res.status(400).send("Invalid model type");
    }

    const updateData = {};

    if (fullName?.trim()) updateData.fullName = fullName.trim();
    if (email?.trim()) updateData.email = email.trim().toLowerCase();

    if (model === "Admin" && username?.trim()) {
      updateData.username = username.toUpperCase().trim();
    } else if (loginId?.trim()) {
      updateData.loginId = loginId.toUpperCase().trim();
    }

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(password, salt);
    }

    Object.keys(otherFields).forEach(key => {
      const value = otherFields[key];
      if (value === "" || value === null || value === undefined) return;
      updateData[key] = value;
    });

    ['bank', 'zone', 'region', 'branch'].forEach(field => {
      if (otherFields[field] === "") updateData[field] = undefined;
    });

    delete updateData._id;
    delete updateData.__v;
    delete updateData.model;
    delete updateData._method;

    const updatedUser = await Model.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) return res.status(404).send("User not found");

    console.log(`✅ ${model} user updated successfully`);
    res.redirect("/admin-users?success=User updated successfully");

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

function getInitials(name) {
  if (!name || typeof name !== "string") return "NA";
  return name.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

module.exports = router;