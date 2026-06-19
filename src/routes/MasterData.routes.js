const express = require("express");
const router = express.Router();
const { Bank, Zone, Region, Branch } = require("../models/MasterData.model");
const auth = require("../middleware/auth");

const ensureAdminUser = (req, res, next) => {
    if (!req.session?.user || 
        String(req.session.user.role || "").toLowerCase() !== "admin"
        ) {
        return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }
    next();
};

// Render Master Data Page
router.get("/", auth("admin"), ensureAdminUser, (req, res) => {
  res.render("masterData");
});

// ====================== BANKS ======================
router.post("/banks", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    let { bankName } = req.body;
    bankName = bankName?.trim();
    
    if (!bankName) {
      return res.status(400).json({ success: false, message: "Bank name required" });
    }

    // Check if bank already exists (active or inactive)
    let existingBank = await Bank.findOne({ bankName: { $regex: new RegExp(`^${bankName}$`, 'i') } });

    if (existingBank) {
      if (existingBank.isActive) {
        return res.status(409).json({ 
          success: false, 
          message: "Bank with this name already exists" 
        });
      } else {
        // Reactivate the soft-deleted bank
        existingBank.isActive = true;
        await existingBank.save();
        return res.status(200).json({ 
          success: true, 
          message: "Bank reactivated successfully", 
          data: existingBank 
        });
      }
    }

    // Create new bank
    const bank = new Bank({ bankName });
    await bank.save();

    res.status(201).json({ success: true, data: bank });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/banks", async (req, res) => {
  const banks = await Bank.find({ isActive: true }).sort({ bankName: 1 });
  res.json(banks);
});

// ====================== ZONES ======================
router.post("/zones", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const { zoneName, bank } = req.body;
    if (!zoneName?.trim() || !bank) {
      return res.status(400).json({ success: false, message: "Zone name and Bank are required" });
    }

    const zone = new Zone({ zoneName: zoneName.trim(), bank });
    await zone.save();
    res.status(201).json({ success: true, data: zone });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/zones", async (req, res) => {
  const { bankId } = req.query;
  const filter = bankId ? { bank: bankId, isActive: true } : { isActive: true };
  const zones = await Zone.find(filter).populate("bank", "bankName");
  res.json(zones);
});

// ====================== REGIONS ======================
router.post("/regions", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const { regionName, bank, zone } = req.body;
    if (!regionName?.trim() || !bank || !zone) {
      return res.status(400).json({
        success: false,
        message: "Bank, Zone and Region Name are required"
      });
    }

    const region = new Region({ regionName: regionName.trim(), bank, zone });
    await region.save();
    res.status(201).json({ success: true, data: region });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/regions", async (req, res) => {
  const { zoneId } = req.query;
  const filter = zoneId ? { zone: zoneId, isActive: true } : { isActive: true };
  const regions = await Region.find(filter).populate("zone", "zoneName");
  res.json(regions);
});

// ====================== BRANCHES ======================
router.post("/branches", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const { branchName, bank, zone, region } = req.body;
    if (!branchName?.trim() || !bank || !zone || !region) {
      return res.status(400).json({
        success: false,
        message: "Bank, Zone, Region and Branch Name are required"
      });
    }

    const branch = new Branch({ 
      branchName: branchName.trim(), 
      bank, 
      zone, 
      region 
    });
    await branch.save();
    res.status(201).json({ success: true, data: branch });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/branches", async (req, res) => {
  const { regionId } = req.query;
  const filter = regionId ? { region: regionId, isActive: true } : { isActive: true };
  const branches = await Branch.find(filter).populate("region", "regionName");
  res.json(branches);
});

// ====================== DELETE ROUTES ======================
router.delete("/banks/:id", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const bankId = req.params.id;

    // Soft delete bank
    const bank = await Bank.findByIdAndUpdate(bankId, { isActive: false }, { new: true });
    if (!bank) return res.status(404).json({ success: false, message: "Bank not found" });

    // Cascade soft delete to children
    await Zone.updateMany({ bank: bankId }, { isActive: false });
    await Region.updateMany({ bank: bankId }, { isActive: false });
    await Branch.updateMany({ bank: bankId }, { isActive: false });

    res.json({ success: true, message: "Bank and related data deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/zones/:id", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const item = await Zone.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Zone not found" });
    res.json({ success: true, message: "Zone deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/regions/:id", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const item = await Region.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Region not found" });
    res.json({ success: true, message: "Region deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/branches/:id", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const item = await Branch.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Branch not found" });
    res.json({ success: true, message: "Branch deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;