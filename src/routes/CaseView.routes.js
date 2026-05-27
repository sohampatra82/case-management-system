// routes/CaseView.routes.js
const express = require("express");
const router = express.Router();
const NewCaseModel = require("../models/NewCase.model");
const mongoose = require("mongoose");

// GET - View Case
router.get("/:id", async (req, res) => {
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

// GET - Edit Form
router.get("/edit/:id", async (req, res) => {
    try {
        const caseData = await NewCaseModel.findById(req.params.id)
            .populate("bank", "bankName")
            .populate("zone", "zoneName")
            .populate("region", "regionName")
            .populate("branch", "branchName")
            .lean();

        if (!caseData) return res.status(404).send("Case Not Found");

        res.render("caseEdit", { caseData });
    } catch (error) {
        console.error("Edit Form Error:", error);
        res.status(500).send("Server Error");
    }
});

// POST - Update Case (Improved)
router.post("/edit/:id", async (req, res) => {
    try {
        const {
            borrowerName, bank, zone, region, branch, currentStage,
            allotmentDate, noticeDate13_2, noticeDate13_4, hearingDate,
            possessionDate, saleDate, initialRemarks
        } = req.body;

        const updateData = {
            borrowerName: borrowerName?.trim(),
            currentStage,
            initialRemarks: initialRemarks?.trim(),
            allotmentDate: allotmentDate ? new Date(allotmentDate) : null,
            noticeDate13_2: noticeDate13_2 ? new Date(noticeDate13_2) : null,
            noticeDate13_4: noticeDate13_4 ? new Date(noticeDate13_4) : null,
            hearingDate: hearingDate ? new Date(hearingDate) : null,
            possessionDate: possessionDate ? new Date(possessionDate) : null,
            saleDate: saleDate ? new Date(saleDate) : null,
        };

        // Handle both ObjectId and Name inputs
        if (bank) {
            if (mongoose.Types.ObjectId.isValid(bank)) {
                updateData.bank = bank;
            } else {
                // Optional: You can add logic to find bank by name if needed
                console.warn(`Invalid Bank ID: ${bank}`);
            }
        }

        if (zone) {
            if (mongoose.Types.ObjectId.isValid(zone)) updateData.zone = zone;
        }
        if (region) {
            if (mongoose.Types.ObjectId.isValid(region)) updateData.region = region;
        }
        if (branch) {
            if (mongoose.Types.ObjectId.isValid(branch)) updateData.branch = branch;
        }

        const updatedCase = await NewCaseModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCase) return res.status(404).send("Case Not Found");

        res.redirect(`/case-view/${req.params.id}?success=updated`);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).send("Update Failed: " + error.message);
    }
});

// DELETE - Delete Case
router.post("/delete/:id", async (req, res) => {
    try {
        await NewCaseModel.findByIdAndDelete(req.params.id);
        res.redirect("/admin-case?deleted=true");
    } catch (error) {
        console.error(error);
        res.status(500).send("Delete Failed");
    }
});

module.exports = router;