import nodemailer from "nodemailer";
import { ApiError } from "./apiError.js";

/**
 * Utility function to send an email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body of the email
 * @param {string} [options.text] - Plain text body (optional, extracted from HTML if omitted)
 */
export const sendEmail = async (options) => {
  try {
    // 1. Check if SMTP configuration exists
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP credentials not found in environment variables. Email will not be sent.");
      return;
    }

    // 2. Create the transporter using SMTP config
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3. Define the email payload
    const mailOptions = {
      from: process.env.EMAIL_FROM || "Ami Infracon <noreply@amiinfracon.com>",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>?/gm, ""), // basic text fallback
    };

    // 4. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] Message ID: ${info.messageId}`);
    return info;

  } catch (error) {
    console.error("[Email Error] Failed to send email:", error.message);
    // Depending on business requirements, you might want to swallow the error 
    // so it doesn't break the user flow, or throw an ApiError. We swallow it here 
    // to prevent crashing forgotPassword if SMTP is misconfigured.
  }
};
