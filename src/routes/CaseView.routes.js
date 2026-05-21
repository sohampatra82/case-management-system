// routes/CaseView.routes.js
const express = require("express");
const router = express.Router();
const NewCaseModel = require("../models/NewCase.model");

// GET - View Case
router.get("/:id", async (req, res) => {
    try {
        const caseData = await NewCaseModel.findById(req.params.id).lean();
        if (!caseData) return res.status(404).send("Case Not Found");

        res.render("caseView", { caseData });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// GET - Edit Form
router.get("/edit/:id", async (req, res) => {
    try {
        const caseData = await NewCaseModel.findById(req.params.id).lean();
        if (!caseData) return res.status(404).send("Case Not Found");

        res.render("caseEdit", { caseData });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// POST - Update Case
router.post("/edit/:id", async (req, res) => {
    try {
        const {
            accountName, bank, zone, region, branch, currentStage,
            allotmentDate, noticeDate13_2, ackDate, noticeDate13_4, publicationDate,
            court, filedBy, applicationDate, filingDate, hearingDate, orderDate, advocateCommissioner,
            policeLetterDate, costReceiveDate, costDepositDate, preIntimationDate,
            possessionDate, saleDate, initialRemarks
        } = req.body;

        await NewCaseModel.findByIdAndUpdate(req.params.id, {
            accountName: accountName?.trim(),
            bank,
            zone,
            region: region?.trim(),
            branch: branch?.trim(),
            currentStage,

            allotmentDate: allotmentDate ? new Date(allotmentDate) : null,
            noticeDate13_2: noticeDate13_2 ? new Date(noticeDate13_2) : null,
            ackDate: ackDate ? new Date(ackDate) : null,
            noticeDate13_4: noticeDate13_4 ? new Date(noticeDate13_4) : null,
            publicationDate: publicationDate ? new Date(publicationDate) : null,

            court: court?.trim(),
            filedBy: filedBy?.trim(),
            applicationDate: applicationDate ? new Date(applicationDate) : null,
            filingDate: filingDate ? new Date(filingDate) : null,
            hearingDate: hearingDate ? new Date(hearingDate) : null,
            orderDate: orderDate ? new Date(orderDate) : null,
            advocateCommissioner: advocateCommissioner?.trim(),

            policeLetterDate: policeLetterDate ? new Date(policeLetterDate) : null,
            costReceiveDate: costReceiveDate ? new Date(costReceiveDate) : null,
            costDepositDate: costDepositDate ? new Date(costDepositDate) : null,
            preIntimationDate: preIntimationDate ? new Date(preIntimationDate) : null,
            possessionDate: possessionDate ? new Date(possessionDate) : null,
            saleDate: saleDate ? new Date(saleDate) : null,

            initialRemarks: initialRemarks?.trim()
        });

        res.redirect(`/case-view/${req.params.id}?success=true`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Update Failed");
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