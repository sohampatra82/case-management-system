const express = require("express");
const router = express.Router();
const { Bank, Zone, Region, Branch } = require("../models/MasterData.model");

// Render Master Data Page
router.get("/", (req, res) => {
  res.render("masterData");
});

// ====================== BANKS ======================
router.post("/banks", async (req, res) => {
  try {
    const { bankName } = req.body;
    if (!bankName)
      return res
        .status(400)
        .json({ success: false, message: "Bank name required" });

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
router.post("/zones", async (req, res) => {
  try {
    const zone = new Zone(req.body);
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
router.post("/regions", async (req, res) => {
  try {
    const { regionName, bank, zone } = req.body;

    if (!regionName || !bank || !zone) {
      return res.status(400).json({
        success: false,
        message: "Bank, Zone and Region Name are required"
      });
    }

    const region = new Region({ regionName, bank, zone });
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
router.post("/branches", async (req, res) => {
  try {
    const { branchName, bank, zone, region } = req.body;

    if (!branchName || !bank || !zone || !region) {
      return res.status(400).json({
        success: false,
        message: "Bank, Zone, Region and Branch Name are required"
      });
    }

    const branch = new Branch({ branchName, bank, zone, region });
    await branch.save();

    res.status(201).json({ success: true, data: branch });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/branches", async (req, res) => {
  const { regionId } = req.query;
  const filter = regionId
    ? { region: regionId, isActive: true }
    : { isActive: true };
  const branches = await Branch.find(filter).populate("region", "regionName");
  res.json(branches);
});

module.exports = router;
