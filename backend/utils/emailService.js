const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"KYC System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message,
      html: html || message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

// Send KYC status update email
const sendKYCStatusEmail = async (user, status, applicationNumber) => {
  const statusMessages = {
    approved: {
      subject: 'KYC Application Approved',
      message: `Congratulations! Your KYC application (${applicationNumber}) has been approved. You can now access all features of our platform.`
    },
    rejected: {
      subject: 'KYC Application Update',
      message: `Your KYC application (${applicationNumber}) requires attention. Please check your dashboard for details and submit the required documents.`
    },
    pending_documents: {
      subject: 'Additional Documents Required',
      message: `Your KYC application (${applicationNumber}) needs additional documents. Please log in to your dashboard to view the requirements.`
    }
  };

  const { subject, message } = statusMessages[status] || {
    subject: 'KYC Application Update',
    message: `Your KYC application (${applicationNumber}) status has been updated. Please check your dashboard for details.`
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
        <h1>KYC System</h1>
      </div>
      <div style="padding: 20px; background-color: #f8f9fa;">
        <h2>${subject}</h2>
        <p>Dear ${user.name},</p>
        <p>${message}</p>
        <p>Application Number: <strong>${applicationNumber}</strong></p>
        <p>If you have any questions, please contact our support team.</p>
        <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
          <p style="margin: 0; font-size: 12px; color: #6c757d;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message,
    html
  });
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to KYC System';
  const message = `Welcome to our KYC System! We're excited to have you on board. Please complete your KYC verification to access all features.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
        <h1>Welcome to KYC System</h1>
      </div>
      <div style="padding: 20px; background-color: #f8f9fa;">
        <h2>Welcome aboard!</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for registering with our KYC System. We're excited to have you on board!</p>
        <p>To get started, please complete your KYC verification by following these steps:</p>
        <ol>
          <li>Log in to your account</li>
          <li>Navigate to the KYC section</li>
          <li>Upload your required documents</li>
          <li>Submit your application for review</li>
        </ol>
        <p>If you have any questions, our support team is here to help.</p>
        <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
          <p style="margin: 0; font-size: 12px; color: #6c757d;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message,
    html
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const subject = 'Password Reset Request';
  const message = `You requested a password reset. Click the link below to reset your password.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
        <h1>Password Reset</h1>
      </div>
      <div style="padding: 20px; background-color: #f8f9fa;">
        <h2>Reset Your Password</h2>
        <p>Dear ${user.name},</p>
        <p>You requested a password reset for your KYC System account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">
          ${process.env.FRONTEND_URL}/reset-password/${resetToken}
        </p>
        <p>This link will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
          <p style="margin: 0; font-size: 12px; color: #6c757d;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message,
    html
  });
};

// Send email verification
const sendEmailVerification = async (user, verificationToken) => {
  const subject = 'Verify Your Email Address';
  const message = `Please verify your email address to complete your registration.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #17a2b8; color: white; padding: 20px; text-align: center;">
        <h1>Email Verification</h1>
      </div>
      <div style="padding: 20px; background-color: #f8f9fa;">
        <h2>Verify Your Email</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for registering with our KYC System. Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">
          ${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}
        </p>
        <p>This link will expire in 24 hours.</p>
        <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
          <p style="margin: 0; font-size: 12px; color: #6c757d;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject,
    message,
    html
  });
};

module.exports = {
  sendEmail,
  sendKYCStatusEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification
}; 