const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

const sendEmailOTP = async (recipientEmail, otpCode) => {
  const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_clinic_email@gmail.com';

  const mailOptions = {
    from: `"MediTrack Health Center" <${process.env.EMAIL_USER || 'no-reply@meditrack.ph'}>`,
    to: recipientEmail,
    subject: 'MediTrack Staff Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #059669; text-align: center;">MediTrack Health Center</h2>
        <p>Hello,</p>
        <p>An administrator is registering your staff account on the MediTrack system. Use this 6-digit verification code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; background-color: #ecfdf5; color: #047857; padding: 12px 24px; border-radius: 8px; border: 1px solid #a7f3d0;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #64748b; font-size: 12px;">This code will expire in <strong>5 minutes</strong>.</p>
      </div>
    `
  };

  if (isConfigured) {
    return await transporter.sendMail(mailOptions);
  } else {
    // Development fallback (prints directly to your server terminal so you can test immediately)
    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL OTP SENT FOR LOCAL TESTING]`);
    console.log(`📬 To: ${recipientEmail}`);
    console.log(`🔑 6-Digit Code: 👉 [ ${otpCode} ] 👈`);
    console.log(`⏳ Valid for: 5 Minutes`);
    console.log(`======================================================\n`);
    return { messageId: 'simulated-id' };
  }
};

module.exports = { sendEmailOTP };