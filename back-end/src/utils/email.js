import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

function ensureConfigured() {
  if (process.env.NODE_ENV === 'test') return;
  if (!apiKey || !fromEmail) {
    throw new Error('SendGrid is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL.');
  }
}

export async function sendPasswordResetEmail({ to, name = 'there', resetUrl }) {
  ensureConfigured();

  // In tests we skip the outbound call to avoid hitting the network.
  if (process.env.NODE_ENV === 'test') return;

  const msg = {
    to,
    from: fromEmail,
    subject: 'Reset your SwapBay password',
    text: [
      `Hi ${name},`,
      '',
      'We received a request to reset your SwapBay password.',
      `You can set a new password using the link below:`,
      resetUrl,
      '',
      'If you did not request this, please ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <p>Hi ${name},</p>
        <p>We received a request to reset your SwapBay password.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 18px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>If you did not request this change, you can safely ignore this email.</p>
      </div>
    `,
  };

  await sgMail.send(msg);
}
