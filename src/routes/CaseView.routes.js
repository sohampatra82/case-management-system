const express = require("express");
const router = express.Router();
const NewCaseModel = require("../models/NewCase.model");
const MasterData = require("../models/MasterData.model");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

const ensureAdminUser = (req, res, next) => {
    if (!req.session?.user || 
        String(req.session.user.role || "").toLowerCase() !== "admin") {
        return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }
    next();
};

// GET - View Case
router.get("/:id", auth("admin"), ensureAdminUser, async (req, res) => {
    try {
        const caseData = await NewCaseModel.findById(req.params.id)
            .populate("bank", "bankName")
            .populate("zone", "zoneName")
            .populate("region", "regionName")
            .populate("branch", "branchName")
            .lean();

        if (!caseData) return res.status(404).send("Case Not Found");

        res.render("caseView", { caseData });
    } catch (error) {
        console.error("Case View Error:", error);
        res.status(500).send(`Server Error: ${error.message}`);
    }
});

// GET - Edit Form (with Master Data)
router.get("/edit/:id", auth("admin"), ensureAdminUser, async (req, res) => {
    try {
        const caseData = await NewCaseModel.findById(req.params.id)
            .populate("bank", "bankName")
            .populate("zone", "zoneName")
            .populate("region", "regionName")
            .populate("branch", "branchName")
            .lean();

        if (!caseData) return res.status(404).send("Case Not Found");

        const MasterData = require("../models/MasterData.model");

        const [banks, zones, regions, branches] = await Promise.all([
            MasterData.Bank.find({ isActive: true }).sort({ bankName: 1 }),
            MasterData.Zone.find({ isActive: true }).sort({ zoneName: 1 }),
            MasterData.Region.find({ isActive: true }).sort({ regionName: 1 }),
            MasterData.Branch.find({ isActive: true }).sort({ branchName: 1 })
        ]);

        res.render("caseEdit", { 
            caseData, 
            banks, 
            zones, 
            regions, 
            branches 
        });
    } catch (error) {
        console.error("Edit Form Error:", error);
        res.status(500).send("Server Error: " + error.message);
    }
});

// POST - Update Case
router.post("/edit/:id", auth("admin"), ensureAdminUser, async (req, res) => {
    try {
        console.log("✅ Edit POST received for ID:", req.params.id); // Debug log

        const {
            borrowerName, outstandingAmount, propertyAddress,
            bank, zone, region, branch,
            currentStage, initialRemarks,
            allotmentDate, noticeDate13_2, ackDate, noticeDate13_4, publicationDate,
            court, filedBy, applicationDate, filingDate, hearingDate, orderDate, advocateCommissioner,
            policeLetterDate, costReceiveDate, costDepositDate, preIntimationDate, possessionDate, saleDate
        } = req.body;

        const updateData = {
            borrowerName: borrowerName?.trim(),
            outstandingAmount: Number(outstandingAmount) || 0,
            propertyAddress: propertyAddress?.trim() || "",
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
        };

        // Update relational fields
        if (bank && mongoose.Types.ObjectId.isValid(bank)) updateData.bank = bank;
        if (zone && mongoose.Types.ObjectId.isValid(zone)) updateData.zone = zone;
        if (region && mongoose.Types.ObjectId.isValid(region)) updateData.region = region;
        if (branch && mongoose.Types.ObjectId.isValid(branch)) updateData.branch = branch;

        const updatedCase = await NewCaseModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { 
                returnDocument: 'after',   // Fixed deprecation warning
                runValidators: true 
            }
        );

        if (!updatedCase) return res.status(404).send("Case Not Found");

        res.redirect(`/case-view/${req.params.id}?success=updated`);

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).send("Update Failed: " + error.message);
    }
});



// DELETE Case
router.post("/delete/:id", auth("admin"), ensureAdminUser, async (req, res) => {
    try {
        const deletedCase = await NewCaseModel.findByIdAndDelete(req.params.id);
        
        if (!deletedCase) {
            return res.status(404).send("Case Not Found");
        }

        console.log("✅ Case Deleted:", req.params.id);
        res.redirect("/admin-case?success=deleted");
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send("Delete Failed: " + error.message);
    }
});


module.exports = router;