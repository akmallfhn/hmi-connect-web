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

// Temporary sender domain until hmiconnect.com is added and DNS-verified under Mailtrap's Sending Domains — swap back once that's done.
const sender = {
  name: "HMI Connect",
  email: "no-reply@sevenpreneur.com",
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
