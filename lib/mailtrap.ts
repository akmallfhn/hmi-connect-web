import "server-only";

import { MailtrapClient } from "mailtrap";

interface SendEmailProps {
  mailRecipients: string[];
  mailSubject: string;
  mailBody?: string;
  mailHtml?: string;
}

const client = new MailtrapClient({
  token: process.env.MAILTRAP_API_TOKEN!,
});

// Only sends once hmiconnect.id is verified under Mailtrap's Sending Domains — an unverified domain times out.
const sender = {
  name: "HMI Connect",
  email: "no-reply@hmiconnect.id",
};

export async function sendEmail({
  mailRecipients,
  mailSubject,
  mailBody,
  mailHtml,
}: SendEmailProps) {
  return client.send({
    from: sender,
    to: mailRecipients.map((email) => ({ email })),
    subject: mailSubject,
    text: mailBody,
    html: mailHtml,
  });
}
