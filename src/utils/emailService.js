const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Helper: Send email with BCC (Privacy Protected)
const sendEmail = async (toEmails, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"SARFAESI CMS" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      bcc: toEmails,
      subject: subject,
      html: html
    });
    console.log(`✅ Email sent to ${toEmails.length} recipients`);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
  }
};

// ====================== NEW CASE NOTIFICATION ======================
const sendCaseNotification = async (caseDoc) => {
  try {
    const ZonalModel = require('../models/ZonalSignUp.model');
    const RegionalModel = require('../models/RegionalSignup.model');
    const BranchModel = require('../models/BranchSignup.model');
    const MasterData = require('../models/MasterData.model');

    const [bankData, zoneData, regionData, branchData] = await Promise.all([
      MasterData.Bank.findById(caseDoc.bank).select('bankName'),
      MasterData.Zone.findById(caseDoc.zone).select('zoneName'),
      MasterData.Region.findById(caseDoc.region).select('regionName'),
      MasterData.Branch.findById(caseDoc.branch).select('branchName')
    ]);

    const [zonalUsers, regionalUsers, branchUsers] = await Promise.all([
      ZonalModel.find({ bank: caseDoc.bank, zone: caseDoc.zone, status: "active" }).select('fullName email'),
      RegionalModel.find({ bank: caseDoc.bank, zone: caseDoc.zone, region: caseDoc.region, status: "active" }).select('fullName email'),
      BranchModel.find({ bank: caseDoc.bank, zone: caseDoc.zone, region: caseDoc.region, branch: caseDoc.branch, status: "active" }).select('fullName email')
    ]);

    const allUsers = [...zonalUsers, ...regionalUsers, ...branchUsers];
    const uniqueEmails = [...new Set(allUsers.filter(u => u?.email?.trim()).map(u => u.email))];

    if (uniqueEmails.length === 0) {
      console.log("⚠️ No recipients found for case notification.");
      return;
    }

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New SARFAESI Case</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f7fa; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 700px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px 40px;">
            <h1 style="margin:0; font-size: 28px;">🔔 New SARFAESI Case Allocated</h1>
            <p style="margin:8px 0 0; opacity: 0.95; font-size: 18px;">Case No: <strong>${caseDoc.caseNumber}</strong></p>
          </div>

          <div style="padding: 40px;">

            <!-- Borrower & Basic Info -->
            <div style="background:#f8fafc; border-radius:8px; padding:25px; margin-bottom:25px;">
              <h2 style="margin:0 0 18px; color:#1e40af; font-size:22px;">Borrower Details</h2>
              <p style="margin:10px 0;"><strong>Borrower Name:</strong> ${caseDoc.borrowerName}</p>
            
              <p style="margin:10px 0;"><strong>Current Stage:</strong> <span style="color:#1e40af; font-weight:600;">${caseDoc.currentStage}</span></p>
            </div>

            <!-- Hierarchy -->
            <div style="background:#f8fafc; padding:25px; border-radius:8px; margin-bottom:25px;">
              <h3 style="margin:0 0 18px; color:#1e40af;">Hierarchy</h3>
              <p><strong>Bank:</strong> ${bankData?.bankName || 'N/A'}</p>
              <p><strong>Zone:</strong> ${zoneData?.zoneName || 'N/A'}</p>
              <p><strong>Region:</strong> ${regionData?.regionName || 'N/A'}</p>
              <p><strong>Branch:</strong> ${branchData?.branchName || 'N/A'}</p>
            </div>

            <!-- SARFAESI Timeline -->
            <div style="margin-bottom:30px;">
              <h3 style="color:#1e40af; margin-bottom:15px;">📅 SARFAESI Timeline</h3>
              <table style="width:100%; border-collapse:collapse; background:#f8fafc; border-radius:8px;">
                <tr><td style="padding:12px 15px; border-bottom:1px solid #e2e8f0;"><strong>Allotment Date</strong></td><td style="padding:12px 15px; text-align:right; border-bottom:1px solid #e2e8f0;">${caseDoc.allotmentDate ? new Date(caseDoc.allotmentDate).toLocaleDateString('en-IN') : 'N/A'}</td></tr>
                <tr><td style="padding:12px 15px; border-bottom:1px solid #e2e8f0;"><strong>13(2) Notice Date</strong></td><td style="padding:12px 15px; text-align:right; border-bottom:1px solid #e2e8f0;">${caseDoc.noticeDate13_2 ? new Date(caseDoc.noticeDate13_2).toLocaleDateString('en-IN') : 'N/A'}</td></tr>
                <tr><td style="padding:12px 15px; border-bottom:1px solid #e2e8f0;"><strong>Acknowledgement Date</strong></td><td style="padding:12px 15px; text-align:right; border-bottom:1px solid #e2e8f0;">${caseDoc.ackDate ? new Date(caseDoc.ackDate).toLocaleDateString('en-IN') : 'N/A'}</td></tr>
                <tr><td style="padding:12px 15px; border-bottom:1px solid #e2e8f0;"><strong>13(4) Notice Date</strong></td><td style="padding:12px 15px; text-align:right; border-bottom:1px solid #e2e8f0;">${caseDoc.noticeDate13_4 ? new Date(caseDoc.noticeDate13_4).toLocaleDateString('en-IN') : 'N/A'}</td></tr>
                <tr><td style="padding:12px 15px; border-bottom:1px solid #e2e8f0;"><strong>Publication Date</strong></td><td style="padding:12px 15px; text-align:right; border-bottom:1px solid #e2e8f0;">${caseDoc.publicationDate ? new Date(caseDoc.publicationDate).toLocaleDateString('en-IN') : 'N/A'}</td></tr>
                <tr><td style="padding:12px 15px;"><strong>Possession Date</strong></td><td style="padding:12px 15px; text-align:right;">${caseDoc.possessionDate ? new Date(caseDoc.possessionDate).toLocaleDateString('en-IN') : 'N/A'}</td></tr>
              </table>
            </div>

            <!-- Court / Section 14 Details -->
            ${(caseDoc.court || caseDoc.filingDate || caseDoc.hearingDate) ? `
            <div style="margin-bottom:30px;">
              <h3 style="color:#1e40af; margin-bottom:15px;">⚖️ Court / Section 14 Details</h3>
              <table style="width:100%; border-collapse:collapse; background:#f8fafc; border-radius:8px;">
                ${caseDoc.court ? `<tr><td style="padding:12px 15px;">Court</td><td style="padding:12px 15px; text-align:right;">${caseDoc.court}</td></tr>` : ''}
                ${caseDoc.filedBy ? `<tr><td style="padding:12px 15px;">Filed By</td><td style="padding:12px 15px; text-align:right;">${caseDoc.filedBy}</td></tr>` : ''}
                ${caseDoc.applicationDate ? `<tr><td style="padding:12px 15px;">Application Date</td><td style="padding:12px 15px; text-align:right;">${new Date(caseDoc.applicationDate).toLocaleDateString('en-IN')}</td></tr>` : ''}
                ${caseDoc.filingDate ? `<tr><td style="padding:12px 15px;">Filing Date</td><td style="padding:12px 15px; text-align:right;">${new Date(caseDoc.filingDate).toLocaleDateString('en-IN')}</td></tr>` : ''}
                ${caseDoc.hearingDate ? `<tr><td style="padding:12px 15px;">Hearing Date</td><td style="padding:12px 15px; text-align:right;">${new Date(caseDoc.hearingDate).toLocaleDateString('en-IN')}</td></tr>` : ''}
                ${caseDoc.orderDate ? `<tr><td style="padding:12px 15px;">Order Date</td><td style="padding:12px 15px; text-align:right;">${new Date(caseDoc.orderDate).toLocaleDateString('en-IN')}</td></tr>` : ''}
                ${caseDoc.advocateCommissioner ? `<tr><td style="padding:12px 15px;">Advocate Commissioner</td><td style="padding:12px 15px; text-align:right;">${caseDoc.advocateCommissioner}</td></tr>` : ''}
              </table>
            </div>` : ''}

            <!-- Possession & Sale Details -->
            <div style="margin-bottom:30px;">
              <h3 style="color:#1e40af; margin-bottom:15px;">Possession & Sale</h3>
              <table style="width:100%; border-collapse:collapse; background:#f8fafc; border-radius:8px;">
                <tr><td style="padding:12px 15px;">Police Letter Date</td><td style="padding:12px 15px; text-align:right;">${caseDoc.policeLetterDate ? new Date(caseDoc.policeLetterDate).toLocaleDateString('en-IN') : 'N/A'}</td></tr>
                <tr><td style="padding:12px 15px;">Possession Date</td><td style="padding:12px 15px; text-align:right;">${caseDoc.possessionDate ? new Date(caseDoc.possessionDate).toLocaleDateString('en-IN') : 'N/A'}</td></tr>
                <tr><td style="padding:12px 15px;">Sale Date</td><td style="padding:12px 15px; text-align:right;">${caseDoc.saleDate ? new Date(caseDoc.saleDate).toLocaleDateString('en-IN') : 'N/A'}</td></tr>
              </table>
            </div>

            <!-- Remarks -->
            ${caseDoc.initialRemarks ? `
            <div style="background:#f0f9ff; padding:25px; border-left:5px solid #3b82f6; border-radius:8px; margin-bottom:25px;">
              <strong>Initial Remarks:</strong><br><br>
              ${caseDoc.initialRemarks}
            </div>` : ''}

          </div>

          <!-- Footer -->
          <div style="background:#f1f5f9; padding:25px; text-align:center; font-size:13px; color:#64748b;">
            This is an automated notification from SARFAESI CMS.<br>
            Generated on ${new Date().toLocaleString('en-IN')}
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(uniqueEmails, `New Case Alert - ${caseDoc.caseNumber}`, emailHTML);

  } catch (err) {
    console.error("❌ New Case Notification Failed:", err.message);
  }
};

// ====================== CASE UPDATE NOTIFICATION TO ADMIN ======================
const sendCaseUpdateNotification = async (caseDoc, updatedBy, userRole, newRemarks = "") => {
  try {
    const MasterData = require('../models/MasterData.model');

    const [bankData, zoneData, regionData, branchData] = await Promise.all([
      MasterData.Bank.findById(caseDoc.bank).select('bankName'),
      MasterData.Zone.findById(caseDoc.zone).select('zoneName'),
      MasterData.Region.findById(caseDoc.region).select('regionName'),
      MasterData.Branch.findById(caseDoc.branch).select('branchName')
    ]);

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Case Updated</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f7fa; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 650px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #b91c1c, #ef4444); color: white; padding: 30px 40px;">
            <h1 style="margin:0; font-size: 28px;">🔄 Case Updated</h1>
            <p style="margin:8px 0 0; opacity: 0.95; font-size: 18px;">Case No: <strong>${caseDoc.caseNumber}</strong></p>
          </div>

          <div style="padding: 40px;">

            <div style="background:#fef2f2; border-radius:8px; padding:20px; margin-bottom:25px;">
              <p><strong>Updated By:</strong> ${updatedBy} (${userRole})</p>
              <p><strong>New Stage:</strong> <span style="color:#b91c1c; font-weight:600;">${caseDoc.currentStage}</span></p>
            </div>

            <div style="background:#f8fafc; border-radius:8px; padding:20px; margin-bottom:25px;">
              <h3 style="margin:0 0 15px; color:#1e40af;">Case Information</h3>
              <p><strong>Borrower:</strong> ${caseDoc.borrowerName}</p>
              <p><strong>Bank:</strong> ${bankData?.bankName || 'N/A'}</p>
              <p><strong>Zone:</strong> ${zoneData?.zoneName || 'N/A'}</p>
              <p><strong>Region:</strong> ${regionData?.regionName || 'N/A'}</p>
              <p><strong>Branch:</strong> ${branchData?.branchName || 'N/A'}</p>
            </div>

            ${newRemarks ? `
            <div style="background:#fefce8; padding:20px; border-left:4px solid #eab308; border-radius:6px; margin-bottom:25px;">
              <strong>New Remark:</strong><br>
              ${newRemarks}
            </div>` : ''}

            <p style="text-align:center; margin:35px 0 10px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin-case" 
                 style="background: linear-gradient(135deg, #b91c1c, #ef4444); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Review Case Update
              </a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f1f5f9; padding:25px; text-align:center; font-size:13px; color:#64748b;">
            SARFAESI CMS • Automated Notification<br>
            Updated on ${new Date().toLocaleString('en-IN')}
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"SARFAESI CMS" <${process.env.SMTP_USER}>`,
      to: "info@anroy.org",
      subject: `Case Update Alert - ${caseDoc.caseNumber}`,
      html: emailHTML
    });

    console.log(`✅ Case update notification sent to Admin`);

  } catch (err) {
    console.error("❌ Update Notification Failed:", err.message);
  }
};

module.exports = { 
  sendCaseNotification, 
  sendCaseUpdateNotification 
};