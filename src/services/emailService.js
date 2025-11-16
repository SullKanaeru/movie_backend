const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Email server connection successful");
      return true;
    } catch (error) {
      console.error("❌ Email server connection failed:", error.message);
      return false;
    }
  }

  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Verify Your Email - Movie App",
      html: `
        <h2>Verify Your Email</h2>
        <p>Hello ${user.fullname},</p>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link expires in 24 hours.</p>
      `,
    };

    try {
      console.log("📧 Sending email to:", user.email);
      await this.transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully!");
      return true;
    } catch (error) {
      console.error("❌ Email send failed:", error.message);
      throw error;
    }
  }
}

module.exports = new EmailService();
