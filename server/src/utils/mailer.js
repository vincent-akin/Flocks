const env = require('../config/env');

/**
 * Minimal pluggable mailer. If SMTP_* environment variables are set, this
 * sends real email via nodemailer; otherwise it logs the message to the
 * console so local/dev environments and this demo remain fully functional
 * without requiring a mail provider. Swap in your provider of choice
 * (SendGrid, Postmark, SES, etc.) by replacing sendViaSmtp below - the
 * calling code (authController) never needs to change.
 */

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtp.host) return null;

  // Lazily required so the `nodemailer` dependency is optional at runtime
  // if the operator never configures SMTP.
  // eslint-disable-next-line global-require
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();

  if (!t) {
    // eslint-disable-next-line no-console
    console.log(`\n[mailer] SMTP not configured - logging email instead of sending:\n  To: ${to}\n  Subject: ${subject}\n  ${text || html}\n`);
    return { delivered: false, logged: true };
  }

  await t.sendMail({ from: env.smtp.from, to, subject, html, text });
  return { delivered: true };
}

module.exports = { sendMail };
