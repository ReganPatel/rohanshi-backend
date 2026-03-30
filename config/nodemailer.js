import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

export const sendOTPVerificationEmail = async ({ email, otp }) => {
  try {
    const mailOptions = {
      from: `"Rohanshi's Creation" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Verify Your Email - One Time Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1E293B; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to Rohanshi's Creation!</h1>
          </div>
          <div style="padding: 30px; background-color: #FAFAFA; text-align: center;">
            <p style="font-size: 16px; color: #333;">Thank you for signing up. Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 10 minutes.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px dashed #D4AF37; display: inline-block;">
              <h2 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #1E293B;">${otp}</h2>
            </div>
            <p style="font-size: 14px; color: #666;">If you didn't request this email, please safely ignore it.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);

  } catch (error) {
    console.error("Error sending OTP email: ", error);
    throw new Error("Failed to send verification email.");
  }
};

export const sendPasswordResetEmail = async ({ email, otp }) => {
  try {
    const mailOptions = {
      from: `"Rohanshi's Creation" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Password Reset Request - One Time Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1E293B; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
          </div>
          <div style="padding: 30px; background-color: #FAFAFA; text-align: center;">
            <p style="font-size: 16px; color: #333;">We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed. This code is valid for 10 minutes.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border: 2px dashed #D4AF37; display: inline-block;">
              <h2 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #1E293B;">${otp}</h2>
            </div>
            <p style="font-size: 14px; color: #666;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP email sent successfully to ${email}`);

  } catch (error) {
    console.error("Error sending Password Reset email: ", error);
    throw new Error("Failed to send password reset email.");
  }
};
