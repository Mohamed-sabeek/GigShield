const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"GigShield Protection" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'GigShield - Your Security Verification Code',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #0f172a; text-align: center;">Verify Your Account</h2>
                <p style="color: #475569; font-size: 16px;">Hello,</p>
                <p style="color: #475569; font-size: 16px;">Welcome to GigShield. Use the following 6-digit code to verify your account and activate your protection.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="display: inline-block; padding: 12px 24px; background-color: #f8fafc; border: 2px solid #3b82f6; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #3b82f6;">
                        ${otp}
                    </span>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="color: #94a3b8; font-size: 10px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">GigShield Security Protocol</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };
