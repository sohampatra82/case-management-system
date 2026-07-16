// utils/emailNotifications.js
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

const sendEmail = async (toEmails, subject, html) => { /* your existing sendEmail */ };

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
          
          <div style="background: linear-gradient(135deg, #b91c1c, #ef4444); color: white; padding: 30px 40px;">
            <h1 style="margin:0; font-size: 28px;">🔄 Remarks Updated</h1>
            <p style="margin:8px 0 0; opacity: 0.95; font-size: 18px;">Case No: <strong>${caseDoc.caseNumber}</strong></p>
          </div>

          <div style="padding: 40px;">

            <div style="background:#fef2f2; border-radius:8px; padding:20px; margin-bottom:25px;">
              <p><strong>Updated By:</strong> ${updatedBy} <strong>(${userRole})</strong></p>
              <p><strong>Role:</strong> ${userRole}</p>
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
              <strong>New Remarks:</strong><br><br>
              ${newRemarks.replace(/\n/g, '<br>')}
            </div>` : ''}

            <p style="text-align:center; margin:35px 0 10px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin-case" 
                 style="background: linear-gradient(135deg, #b91c1c, #ef4444); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View Case
              </a>
            </p>
          </div>

          <div style="background:#f1f5f9; padding:25px; text-align:center; font-size:13px; color:#64748b;">
            SARFAESI CMS • Automated Notification<br>
            Updated on ${new Date().toLocaleString('en-IN')}
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"SARFAESI CMS" <${process.env.SMTP_EMAIL}>`,
      to: process.env.ADMIN_EMAIL || "info@anroy.org",
      subject: `Remarks Updated - ${caseDoc.caseNumber} by ${userRole}`,
      html: emailHTML
    });

    console.log(`✅ Remarks update notification sent to Admin by ${userRole}`);

  } catch (err) {
    console.error("❌ Update Notification Failed:", err.message);
  }
};

module.exports = { sendCaseNotification, sendCaseUpdateNotification };