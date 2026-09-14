// Order / inquiry email via Resend.
//
// Owner-provided (Vercel env):
//   RESEND_API_KEY   – from resend.com
//   ORDER_EMAIL_TO   – where orders/inquiries land (default thedeli@thebrothersdeli.com)
//   ORDER_EMAIL_FROM – a verified sender on the deli's domain
//                      (e.g. "The Brothers Deli <orders@thebrothersdeli.com>")
//
// Sending from the domain requires a few DNS records that Resend generates.
// Until RESEND_API_KEY is set, emails are logged to the server instead of sent,
// so the funnels work end-to-end in development without blocking on the account.

import { Resend } from "resend";

const TO = process.env.ORDER_EMAIL_TO || "thedeli@thebrothersdeli.com";
const FROM =
  process.env.ORDER_EMAIL_FROM || "The Brothers Deli <orders@thebrothersdeli.com>";

export type SendResult = { sent: boolean; id?: string; reason?: string };

export async function sendDeliEmail(opts: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(
      `[email:not-configured] would send to ${TO}\nSubject: ${opts.subject}\n\n${opts.text}`
    );
    return { sent: false, reason: "RESEND_API_KEY not set (logged instead)" };
  }
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.text,
  });
  if (error) {
    console.error("[email:error]", error);
    return { sent: false, reason: error.message };
  }
  return { sent: true, id: data?.id };
}
