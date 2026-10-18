import "server-only";

import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT } from "./constants";

interface SendEmailProps {
  mailRecipients: string[];
  mailSubject: string;
  mailBody?: string;
  mailHtml?: string;
  replyTo?: string;
}

export class MailerNotConfiguredError extends Error {
  constructor() {
    super("SMTP_USER and SMTP_PASS must be set.");
  }
}

// Same login as the sibling vanatama project: for Gmail, SMTP_PASS is an App Password, never the account password.
export async function sendEmail({
  mailRecipients,
  mailSubject,
  mailBody,
  mailHtml,
  replyTo,
}: SendEmailProps) {
  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) throw new MailerNotConfiguredError();

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter.sendMail({
    from: `"HMI Connect" <${SMTP_USER}>`,
    to: mailRecipients,
    replyTo,
    subject: mailSubject,
    text: mailBody,
    html: mailHtml,
  });
}
