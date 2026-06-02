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

// Helper: Send email individually or with BCC (Privacy Protected)
const sendEmail = async (toEmails, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"SARFAESI CMS" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,           // Visible sender
      bcc: toEmails,                       // Privacy: Recipients can't see each other
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

    // Populate Master Data
    const [bankData, zoneData, regionData, branchData] = await Promise.all([
      MasterData.Bank.findById(caseDoc.bank).select('bankName'),
      MasterData.Zone.findById(caseDoc.zone).select('zoneName'),
      MasterData.Region.findById(caseDoc.region).select('regionName'),
      MasterData.Branch.findById(caseDoc.branch).select('branchName')
    ]);

    // Get active users
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
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; max-width: 650px; margin: 0 auto;">
        <h2 style="color: #1e40af;">🔔 New SARFAESI Case Allocated</h2>
        <p><strong>Case Number:</strong> ${caseDoc.caseNumber}</p>
        <p><strong>Borrower Name:</strong> ${caseDoc.borrowerName}</p>
        <p><strong>Outstanding Amount:</strong> ₹${Number(caseDoc.outstandingAmount || 0).toLocaleString('en-IN')}</p>
        <p><strong>Property Address:</strong> ${caseDoc.propertyAddress || 'N/A'}</p>
        <p><strong>Current Stage:</strong> ${caseDoc.currentStage}</p>
        ${caseDoc.initialRemarks ? `<p><strong>Initial Remarks:</strong> ${caseDoc.initialRemarks}</p>` : ''}
        
        <hr style="border: 1px solid #e5e7eb;">
        
        <p><strong>Bank:</strong> ${bankData?.bankName || 'N/A'}</p>
        <p><strong>Zone:</strong> ${zoneData?.zoneName || 'N/A'}</p>
        <p><strong>Region:</strong> ${regionData?.regionName || 'N/A'}</p>
        <p><strong>Branch:</strong> ${branchData?.branchName || 'N/A'}</p>
        
        <p><strong>Created At:</strong> ${new Date(caseDoc.createdAt).toLocaleString('en-IN')}</p>

        <br>
      

        <p style="font-size: 13px; color: #666; margin-top: 20px;">
          This is an automated notification from SARFAESI CMS.
        </p>
      </div>
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
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; max-width: 650px;">
        <h2 style="color: #b91c1c;">🔄 Case Updated</h2>
        <p><strong>Case Number:</strong> ${caseDoc.caseNumber}</p>
        <p><strong>Borrower:</strong> ${caseDoc.borrowerName}</p>
        <p><strong>Updated By:</strong> ${updatedBy}</p>
        <p><strong>User Role:</strong> ${userRole}</p>
        <p><strong>New Stage:</strong> ${caseDoc.currentStage}</p>
        ${newRemarks ? `<p><strong>New Remark:</strong> ${newRemarks}</p>` : ''}
        
        <hr>
        <p><strong>Bank:</strong> ${bankData?.bankName || 'N/A'}</p>
        <p><strong>Zone:</strong> ${zoneData?.zoneName || 'N/A'}</p>
        <p><strong>Region:</strong> ${regionData?.regionName || 'N/A'}</p>
        <p><strong>Branch:</strong> ${branchData?.branchName || 'N/A'}</p>
        
        <p><strong>Updated At:</strong> ${new Date().toLocaleString('en-IN')}</p>

        <br>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin-case" 
           style="background-color: #b91c1c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
           Review Update
        </a> 
      </div>
    `;

    await transporter.sendMail({
      from: `"SARFAESI CMS" <${process.env.SMTP_USER}>`,
      to: "info@anroy.org",           // Admin Email
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