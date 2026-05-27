import { transporter } from "../config/nodemailer.js";

export const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Chess Master" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Message sent:", info.messageId);
  } catch (err) {
    console.log("Mail sending error:", err.message);

    throw new Error("Failed to send email");
  }
};
