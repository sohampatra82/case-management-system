const express = require("express");
const router = express.Router();
const NewCaseModel = require("../models/NewCase.model");
const { sendCaseNotification } = require("../utils/emailService");
const auth = require("../middleware/auth");

const ensureAdminUser = (req, res, next) => {
    if (!req.session?.user || 
        String(req.session.user.role || "").toLowerCase() !== "admin"
        ) {
        return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }
    next();
};

// Render Form
router.get("/", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const banks = await require("../models/MasterData.model").Bank
      .find({ isActive: true })
      .sort({ bankName: 1 });
    res.render("newCase", { banks });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading form");
  }
});

// Create Case + Send Email Notification
router.post("/", auth("admin"), ensureAdminUser, async (req, res) => {
  try {
    const {
      borrowerName, outstandingAmount, propertyAddress,
      bank, zone, region, branch,
      currentStage, initialRemarks,
      allotmentDate, noticeDate13_2, ackDate, noticeDate13_4, publicationDate,
      court, filedBy, applicationDate, filingDate, hearingDate, orderDate, advocateCommissioner,
      policeLetterDate, costReceiveDate, costDepositDate, preIntimationDate, possessionDate, saleDate
    } = req.body;

    if (!borrowerName || !bank || !zone || !region || !branch) {
      return res.status(400).send("Error: Borrower Name, Bank, Zone, Region and Branch are required");
    }

    const newCase = new NewCaseModel({
      caseNumber: `CASE-${Date.now()}`,
      borrowerName: borrowerName?.trim(),
      // outstandingAmount: Number(outstandingAmount) || 0,
      // propertyAddress: propertyAddress?.trim() || "",

      bank, zone, region, branch,

      currentStage: currentStage || "ALLOTMENT",
      initialRemarks: initialRemarks?.trim() || "",

      allotmentDate: allotmentDate ? new Date(allotmentDate) : null,
      noticeDate13_2: noticeDate13_2 ? new Date(noticeDate13_2) : null,
      ackDate: ackDate ? new Date(ackDate) : null,
      noticeDate13_4: noticeDate13_4 ? new Date(noticeDate13_4) : null,
      publicationDate: publicationDate ? new Date(publicationDate) : null,

      court: court?.trim() || "",
      filedBy: filedBy?.trim() || "",
      applicationDate: applicationDate ? new Date(applicationDate) : null,
      filingDate: filingDate ? new Date(filingDate) : null,
      hearingDate: hearingDate ? new Date(hearingDate) : null,
      orderDate: orderDate ? new Date(orderDate) : null,
      advocateCommissioner: advocateCommissioner?.trim() || "",

      policeLetterDate: policeLetterDate ? new Date(policeLetterDate) : null,
      costReceiveDate: costReceiveDate ? new Date(costReceiveDate) : null,
      costDepositDate: costDepositDate ? new Date(costDepositDate) : null,
      preIntimationDate: preIntimationDate ? new Date(preIntimationDate) : null,
      possessionDate: possessionDate ? new Date(possessionDate) : null,
      saleDate: saleDate ? new Date(saleDate) : null,
    });

    await newCase.save();

    // 🔥 Send Email Notification to Zone, Region & Branch Users
    await sendCaseNotification(newCase);

    res.redirect("/admin-case?success=true");

  } catch (error) {
    console.error("Create Case Error:", error);
    res.status(500).send(`Create Case Error: ${error.message}`);
  }
});

module.exports = router;