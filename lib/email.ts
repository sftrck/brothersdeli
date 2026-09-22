// Order / inquiry email via Resend.
//
// Credentials (Vercel env). Supports BOTH the Vercel Resend integration's
// prefixed vars and plain ones:
//   RESEND_API_KEY  or  brothersdeli_RESEND_API_KEY   – Resend API key
//   brothersdeli_RESEND_EMAIL_DOMAIN                  – verified sending domain
//   ORDER_EMAIL_TO   – where orders/inquiries land (default thedeli@thebrothersdeli.com)
//   ORDER_EMAIL_FROM – explicit "Name <addr>" override for the sender
//
// Sending from a custom domain requires that domain to be verified in Resend.
// If no verified domain is available we fall back to Resend's onboarding sender
// (which only delivers to the Resend account owner's address). Until a key is
// set, emails are logged instead of sent.

import { Resend } from "resend";

function resendKey(): string {
  return (
    process.env.RESEND_API_KEY ||
    process.env.brothersdeli_RESEND_API_KEY ||
    ""
  );
}

function recipient(): string {
  return process.env.ORDER_EMAIL_TO || "thedeli@thebrothersdeli.com";
}

function sender(): string {
  if (process.env.ORDER_EMAIL_FROM) return process.env.ORDER_EMAIL_FROM;
  const domain = process.env.brothersdeli_RESEND_EMAIL_DOMAIN;
  if (domain) return `The Brothers Deli <orders@${domain}>`;
  // Always-available Resend sender (delivers to the account owner only).
  return "The Brothers Deli <onboarding@resend.dev>";
}

export type SendResult = { sent: boolean; id?: string; reason?: string };

export async function sendDeliEmail(opts: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  const key = resendKey();
  const to = recipient();
  if (!key) {
    console.log(
      `[email:not-configured] would send to ${to}\nSubject: ${opts.subject}\n\n${opts.text}`
    );
    return { sent: false, reason: "no Resend API key (logged instead)" };
  }
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: sender(),
    to,
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
