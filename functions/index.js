const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
admin.initializeApp();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass,
  },
});

exports.sendEmailReply = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snap, context) => {
    const notification = snap.data();

    // Only process email_reply notifications
    if (notification.type !== "email_reply") {
      console.log("Not an email reply notification, skipping");
      return null;
    }

    try {
      // Get inquiry details if available
      let inquiryDetails = "your inquiry";
      if (notification.inquiryId) {
        const inquiryDoc = await admin.firestore()
          .collection("contactSubmissions")
          .doc(notification.inquiryId)
          .get();
        
        if (inquiryDoc.exists) {
          inquiryDetails = inquiryDoc.data().jobDetails || "your inquiry";
        }
      }

      // Prepare email options
      const mailOptions = {
        from: `"AI•TECH Solutions" <${functions.config().email.user}>`,
        to: notification.recipientEmail,
        subject: `Re: Your Inquiry - AI•TECH Solutions`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">AI•TECH Solutions</h2>
            <p>Dear ${notification.recipientName},</p>
            <p>Thank you for your inquiry. Here is our response:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${notification.message}
            </div>
            <p>Best regards,<br>AI•TECH Solutions Team</p>
          </div>
        `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Update notification status
      await snap.ref.update({
        status: "delivered",
        deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return null;
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Update notification with error status
      await snap.ref.update({
        status: "failed",
        error: error.message,
      });

      return null;
    }
  });