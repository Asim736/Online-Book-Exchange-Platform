import nodemailer from 'nodemailer';

// Create reusable transporter using Gmail App Password
const createTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('[EMAIL] GMAIL_USER or GMAIL_APP_PASSWORD not set — emails will not be sent');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    connectionTimeout: 15000,  // 15s timeout — fail fast instead of hanging
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
};

/**
 * Send a verification email to confirm the user's email address.
 * @param {string} to - recipient email address
 * @param {string} token - secure random verification token
 */
export async function sendVerificationEmail(to, token) {
  const transporter = createTransporter();
  if (!transporter) return;

  const frontendUrl = process.env.FRONTEND_URL || 'https://exchangebook.me';
  const verifyLink = `${frontendUrl}/#/verify-email?token=${encodeURIComponent(token)}`;

  const mailOptions = {
    from: `"Book Exchange" <${process.env.GMAIL_USER || 'noreply@exchangebook.me'}>`,
    to,
    subject: 'Confirm your email address — Book Exchange',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, Helvetica, sans-serif; background: #f4f4f4; margin:0; padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:30px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
              <tr>
                <td style="background:#667eea; padding:30px; text-align:center;">
                  <h1 style="color:#ffffff; margin:0; font-size:22px;">📚 Book Exchange</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">
                  <h2 style="color:#333; margin:0 0 12px 0;">Confirm your email</h2>
                  <p style="color:#555; line-height:1.6; margin:0 0 20px 0;">
                    Thanks for joining! Click the button below to verify your email address and start exchanging books.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                    <tr>
                      <td align="center" style="background:#667eea; border-radius:6px;">
                        <a href="${verifyLink}"
                           style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:bold;">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color:#888; font-size:13px; line-height:1.5; margin:0;">
                    This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
                  </p>
                  <p style="color:#888; font-size:13px; line-height:1.5; margin:10px 0 0 0;">
                    Or copy this link into your browser:<br>
                    <span style="color:#667eea; word-break:break-all;">${verifyLink}</span>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9f9f9; padding:16px; text-align:center; border-top:1px solid #eee;">
                  <p style="color:#aaa; font-size:12px; margin:0;">Book Exchange Platform</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Verification email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send verification email to ${to}:`, error.message);
    if (error.code === 'EAUTH') {
      console.error('[EMAIL] Authentication failed — check GMAIL_USER and GMAIL_APP_PASSWORD env vars');
    }
    throw error;
  }
};

/**
 * Send a password reset email with a reset link.
 * @param {string} to - recipient email address
 * @param {string} token - secure random reset token
 */
export async function sendResetPasswordEmail(to, token) {
  const transporter = createTransporter();
  if (!transporter) return;

  const frontendUrl = process.env.FRONTEND_URL || 'https://exchangebook.me';
  const resetLink = `${frontendUrl}/#/reset-password?token=${encodeURIComponent(token)}`;

  const mailOptions = {
    from: `"Book Exchange" <${process.env.GMAIL_USER || 'noreply@exchangebook.me'}>`,
    to,
    subject: 'Reset your password — Book Exchange',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, Helvetica, sans-serif; background: #f4f4f4; margin:0; padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:30px 0;">
          <tr><td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
              <tr>
                <td style="background:#667eea; padding:30px; text-align:center;">
                  <h1 style="color:#ffffff; margin:0; font-size:22px;">📚 Book Exchange</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;">
                  <h2 style="color:#333; margin:0 0 12px 0;">Reset your password</h2>
                  <p style="color:#555; line-height:1.6; margin:0 0 20px 0;">
                    We received a request to reset your password. Click the button below to set a new one.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                    <tr>
                      <td align="center" style="background:#667eea; border-radius:6px;">
                        <a href="${resetLink}"
                           style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:16px; font-weight:bold;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color:#888; font-size:13px; line-height:1.5; margin:0;">
                    This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
                  </p>
                  <p style="color:#888; font-size:13px; line-height:1.5; margin:10px 0 0 0;">
                    Or copy this link into your browser:<br>
                    <span style="color:#667eea; word-break:break-all;">${resetLink}</span>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9f9f9; padding:16px; text-align:center; border-top:1px solid #eee;">
                  <p style="color:#aaa; font-size:12px; margin:0;">Book Exchange Platform</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Reset password email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send reset password email to ${to}:`, error.message);
    if (error.code === 'EAUTH') {
      console.error('[EMAIL] Authentication failed — check GMAIL_USER and GMAIL_APP_PASSWORD env vars');
    }
    throw error;
  }
};
