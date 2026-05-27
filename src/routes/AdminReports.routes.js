const express = require("express");
const router = express.Router();
const NewCaseModel = require("../models/NewCase.model");

// GET Reports Page
router.get("/", (req, res) => res.render("adminReports"));

// ==================== CSV DOWNLOAD - FIXED ====================

router.get("/download/csv", async (req, res) => {
  try {
    const cases = await NewCaseModel.find({})
      .lean()
      .populate('bank', 'bankName')        // Adjust field names as per your schema
      .populate('zone', 'zoneName')        // Example: if zone is a reference
      .populate('region', 'regionName')
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });

    let csv = 
      "SI No,Bank,Zone,Region,Branch,Account Name,Stage,Allotment Date,13(2) Date,13(4) Date,Possession Date,Created At\n";

    cases.forEach((c, i) => {
      const formatDate = (dateField) => {
        if (!dateField) return "";
        const date = new Date(dateField);
        return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
      };

      const bankName = c.bank?.bankName || c.bank || "";
      const zoneName = c.zone?.zoneName || c.zone || "";
      const regionName = c.region?.regionName || c.region || "";
      const branchName = c.branch?.branchName || c.branch || "";

      csv += 
        `${i + 1},"${bankName}","${zoneName}","${regionName}","${branchName}",` +
        `"${(c.accountName || "").replace(/"/g, '""')}","${c.currentStage || ""}",` +
        `"${formatDate(c.allotmentDate)}","${formatDate(c.noticeDate13_2)}",` +
        `"${formatDate(c.noticeDate13_4)}","${formatDate(c.possessionDate)}",` +
        `"${formatDate(c.createdAt)}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=SARFAESI_Report.csv");
    res.send(csv);
  } catch (error) {
    console.error("CSV Download Error:", error);
    res.status(500).send("Error generating CSV file");
  }
});

// ==================== EXCEL DOWNLOAD ====================
router.get("/download/excel", async (req, res) => {
  try {
    const cases = await NewCaseModel.find({}).lean().sort({ createdAt: -1 });

    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SARFAESI Report");

    worksheet.columns = [
      { header: "SI No", key: "si", width: 8 },
      { header: "Bank", key: "bank", width: 22 },
      { header: "Zone", key: "zone", width: 15 },
      { header: "Region", key: "region", width: 20 },
      { header: "Branch", key: "branch", width: 25 },
      { header: "Account Name", key: "accountName", width: 30 },
      { header: "Stage", key: "stage", width: 18 },
      { header: "Allotment Date", key: "allotment", width: 15 },
      { header: "13(2) Date", key: "notice13_2", width: 15 },
      { header: "13(4) Date", key: "notice13_4", width: 15 },
      { header: "Possession Date", key: "possession", width: 15 },
      { header: "Created At", key: "createdAt", width: 15 }
    ];

    const formatDate = dateField => {
      if (!dateField) return "";
      const date = new Date(dateField);
      return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
    };

    cases.forEach((c, i) => {
      worksheet.addRow({
        si: i + 1,
        bank: c.bank,
        zone: c.zone,
        region: c.region || "",
        branch: c.branch || "",
        accountName: c.accountName,
        stage: c.currentStage,
        allotment: formatDate(c.allotmentDate),
        notice13_2: formatDate(c.noticeDate13_2),
        notice13_4: formatDate(c.noticeDate13_4),
        possession: formatDate(c.possessionDate),
        createdAt: formatDate(c.createdAt)
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=SARFAESI_Report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel Download Error:", error);
    res.status(500).send("Error generating Excel file");
  }
});

module.exports = router;
