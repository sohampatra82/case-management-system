const express = require("express");
const router = express.Router();
const NewCaseModel = require("../models/NewCase.model");



router.get("/", (req, res) => {
  res.render("newCase");
});


// POST - Create Case
router.post("/", async (req, res) => {
    try {
        const {
            accountName,
            bank,
            zone,
            region,
            branch,
            currentStage,

            allotmentDate,
            noticeDate13_2,
            ackDate,
            noticeDate13_4,
            publicationDate,

            court,
            filedBy,
            applicationDate,
            filingDate,
            hearingDate,
            orderDate,
            advocateCommissioner,

            policeLetterDate,
            costReceiveDate,
            costDepositDate,
            preIntimationDate,
            possessionDate,
            saleDate,

            initialRemarks
        } = req.body;

        // Create new case
        const newCase = await NewCaseModel.create({
            accountName: accountName?.trim(),
            bank,
            zone,
            region: region?.trim(),
            branch: branch?.trim(),
            currentStage: currentStage || "ALLOTMENT",

            // Convert string dates to Date objects (important!)
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

        // console.log("✅ New Case Created Successfully:", newCase._id);

        // Redirect with success message
        res.redirect("/admin-case?success=true&message=Case created successfully");

    } catch (error) {
        console.error("❌ Error creating case:", error);

        // Better error response
        if (error.name === 'ValidationError') {
            return res.status(400).send(`Validation Error: ${error.message}`);
        }

        res.status(500).send("Server Error: Unable to create case. Please try again.");
    }
});

module.exports = router;




