// routes/Regional/RegionalFeedBack.routes.js
require("dotenv").config();
const express = require("express");
const router = express.Router();
const FeedbackModel = require("../../models/FeedBack.model");
const nodemailer = require("nodemailer");
const RegionalModel = require("../../models/RegionalSignup.model"); // ← Add this

const auth = require("../../middleware/auth");



const ensureRegionalUser = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== "regional" || !req.session.user.zone) {
        return res.status(403).send("PLEASE LOGIN WITH APPROPRIATE CREDENTIALS");
    }
    next();
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL || "info@anroy.org",
        pass: process.env.EMAIL_PASSWORD
    }
});

// ====================== PROFESSIONAL FEEDBACK EMAIL ======================
const createFeedbackEmailHTML = (feedback, user) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Feedback - SARFAESI CMS</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f7fa; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 700px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px 40px;">
                <h1 style="margin:0; font-size: 28px;">📬 New Feedback Received</h1>
                <p style="margin:8px 0 0; opacity: 0.95; font-size: 18px;">
                    Category: <strong>${feedback.category}</strong>
                </p>
            </div>

            <div style="padding: 40px;">

                <!-- Submitter Info -->
                <div style="background:#f8fafc; border-radius:8px; padding:25px; margin-bottom:25px;">
                    <h2 style="margin:0 0 18px; color:#1e40af; font-size:22px;">Submitted By</h2>
                    <p style="margin:10px 0;"><strong>Name:</strong> ${user.fullName || user.loginId}</p>
                    <p style="margin:10px 0;"><strong>Email:</strong> ${user.email || 'N/A'}</p>
                    <p style="margin:10px 0;"><strong>Role:</strong> ${user.role || 'Zonal'}</p>
                    ${user.zoneName ? `<p style="margin:10px 0;"><strong>Zone:</strong> ${user.zoneName}</p>` : ''}
                </div>

                <!-- Feedback Details -->
                <div style="background:#f8fafc; border-radius:8px; padding:25px; margin-bottom:25px;">
                    <h3 style="margin:0 0 15px; color:#1e40af;">Feedback Details</h3>
                    <p><strong>Subject:</strong> ${feedback.subject}</p>
                    <p><strong>Category:</strong> ${feedback.category}</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                  <div style="text-align:center;">
                        <strong style="color:#1e40af; font-size:17px;">Description</strong>
                    </div>
                    <div style="background:white; padding:25px; border-radius:8px; margin-top:15px; line-height:1.7; font-size:15.5px; color:#334155; text-align:left;">
                        ${feedback.description.replace(/\n/g, '<br><br>')}
                    </div>
                </div>

            </div>

            <!-- Footer -->
            <div style="background:#f1f5f9; padding:25px; text-align:center; font-size:13px; color:#64748b;">
         
                SARFAESI CMS • Automated Notification • ${new Date().toLocaleString('en-IN')}
            </div>
        </div>
    </body>
    </html>`;
};

router.get("/", auth("regional"),  ensureRegionalUser, (req, res) => {
    res.render("RegionalFeedBack");
});

router.post("/",  auth("regional"), ensureRegionalUser, async (req, res) => {
    try {
        let { category, subject, description } = req.body;

        if (category) {
            category = category.trim().replace(/\s+/g, ' ');
        }

        if (!category || !subject || !description) {
            return res.status(400).json({ 
                success: false, 
                message: "Category, Subject and Description are required" 
            });
        }

        let currentUser = req.session?.user;

        if (!currentUser) {
            return res.status(401).json({ success: false, message: "Please login first" });
        }

        // ✅ FIX: Populate email and zoneName
        const regionalUser = await RegionalModel.findById(currentUser.id)
            .populate('zone', 'zoneName')
            .lean();

        if (!regionalUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const enrichedUser = {
            ...currentUser,
            fullName: regionalUser.fullName,
            email: regionalUser.email,
            zoneName: regionalUser.zone?.zoneName || 'N/A'
        };

        // Save Feedback
        const feedback = new FeedbackModel({
            category,
            subject: subject.trim(),
            description: description.trim(),
            submittedBy: enrichedUser.fullName || enrichedUser.loginId,
            userEmail: enrichedUser.email,
            role: enrichedUser.role || "regional",
            zone: enrichedUser.zone || regionalUser.zone?._id
        });

        await feedback.save();

        // Send Email
        const mailOptions = {
            from: `"SARFAESI CMS" <${process.env.ADMIN_EMAIL}>`,
            to: "info@anroy.org",
            subject: `New Feedback - ${category}: ${subject}`,
            html: createFeedbackEmailHTML(feedback, enrichedUser)
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: "Feedback submitted successfully!",
            feedbackId: feedback._id 
        });

    } catch (error) {
        console.error("Feedback Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Something went wrong. Please try again." 
        });
    }
});

module.exports = router;