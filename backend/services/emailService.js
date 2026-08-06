import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log(`[Email Service] Connecting to custom SMTP server (${host}:${port}) for ${user}...`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } else {
    console.log('[Email Service] No custom SMTP set. Creating free Ethereal test mailer account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email Service] Ethereal SMTP test account initialized: ${testAccount.user}`);
    } catch (err) {
      console.error('[Email Service] Failed to initialize Ethereal test mailer:', err);
    }
  }

  return transporter;
}

export const sendVerificationEmail = async (recipientEmail, recipientName, verificationUrl) => {
  try {
    const mailTransporter = await getTransporter();
    if (!mailTransporter) {
      console.warn('[Email Service] Mail transporter unavailable.');
      return false;
    }

    const fromAddress = process.env.SMTP_FROM || '"DocPilot AI" <no-reply@docpilot.ai>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .content { padding: 36px 32px; color: #334155; line-height: 1.6; }
          .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background: #0284c7; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3); }
          .url-box { background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; word-break: break-all; color: #64748b; margin-top: 20px; }
          .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DocPilot AI</h1>
          </div>
          <div class="content">
            <div class="greeting">Welcome to DocPilot AI, ${recipientName}!</div>
            <p>Please confirm your email address to complete registration and log in to your Intelligent Document Processing dashboard.</p>
            
            <div class="btn-container">
              <a href="${verificationUrl}" class="btn" target="_blank">Confirm Email Address & Log In →</a>
            </div>

            <p style="font-size: 13px; color: #64748b;">This link is valid for <strong>15 minutes</strong>. If you did not create a DocPilot AI account, please ignore this message.</p>
            
            <div class="url-box">
              Or copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #0284c7;">${verificationUrl}</a>
            </div>
          </div>
          <div class="footer">
            © 2026 DocPilot AI Inc. Enterprise Intelligent Document Processing.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await mailTransporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject: 'Verify your DocPilot AI Account',
      text: `Welcome to DocPilot AI, ${recipientName}! Confirm your email address here: ${verificationUrl}`,
      html: htmlContent
    });

    console.log(`✉️ [Email Sent Successfully] To: ${recipientEmail}, MessageId: ${info.messageId}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [Ethereal Mail Preview URL]: ${previewUrl}`);
    }

    return true;
  } catch (error) {
    console.error('[Email Service Error]: Failed to send email to', recipientEmail, error);
    return false;
  }
};
