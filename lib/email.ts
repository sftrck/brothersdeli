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
  // Use an explicit verified sender when provided (e.g. once a real domain is
  // verified in Resend: "The Brothers Deli <orders@thebrothersdeli.com>").
  // Otherwise fall back to Resend's always-verified onboarding sender, which
  // delivers only to the Resend account owner's address — good enough to get
  // notifications flowing before a domain is verified.
  return process.env.ORDER_EMAIL_FROM || "The Brothers Deli <onboarding@resend.dev>";
}

export type SendResult = { sent: boolean; id?: string; reason?: string };

// Where the deli can be reached — reused in the customer-facing receipt.
const DELI = {
  name: "The Brothers Deli",
  address: "50 South Sixth Street, Skyway Level, Suite #220",
  cityZip: "Minneapolis, MN 55402",
  phone: "(612) 314-8007",
  hours: "Mon–Thu 7:30 AM–1:30 PM · Fri 10:30 AM–1:00 PM",
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export type ReceiptLine = { name: string; detail?: string; amount: number };
export type CustomerReceipt = {
  orderId: string;
  kind: "Pickup" | "Delivery" | "Catering";
  name: string;
  lines: ReceiptLine[];
  total: number; // our pre-tax total (items + any delivery fee)
  // Final amount actually charged incl. tax, from Payanywhere, when known.
  paidTotal?: number;
  pickupTime?: string;
  address?: string;
  deliveryEta?: string;
  deliveryNotes?: string;
  headcount?: number;
  eventDate?: string;
};

// Builds the plain-text order confirmation / receipt sent to the customer.
// Fires after payment succeeds; pass `paidTotal` (Payanywhere's taxed total)
// once the payment flow is wired, and the receipt shows the exact amount paid.
export function buildCustomerReceipt(o: CustomerReceipt): {
  subject: string;
  text: string;
} {
  const firstName = o.name.trim().split(/\s+/)[0] || "there";
  const isCatering = o.kind === "Catering";
  const isDelivery = o.kind === "Delivery" || (isCatering && !!o.address);
  const paid = o.paidTotal != null;

  const fulfillment: string[] = [];
  if (isCatering && o.eventDate) fulfillment.push(`Event date: ${o.eventDate}`);
  if (isCatering && o.headcount) fulfillment.push(`Headcount: ${o.headcount}`);
  if (isDelivery) {
    fulfillment.push(`Delivery to: ${o.address ?? ""}`);
    if (o.deliveryEta) fulfillment.push(`Estimated arrival: ${o.deliveryEta}`);
    if (o.deliveryNotes) fulfillment.push(`Notes: ${o.deliveryNotes}`);
  } else {
    fulfillment.push(`Pickup: skyway counter, ${DELI.address}`);
    if (o.pickupTime) fulfillment.push(`Pickup time: ${o.pickupTime}`);
  }

  const itemLines = o.lines
    .map(
      (l) =>
        `  ${l.name}${l.detail ? `\n      ${l.detail}` : ""}\n      ${money(l.amount)}`
    )
    .join("\n");

  const totalBlock = paid
    ? [`  TOTAL PAID (incl. tax):  ${money(o.paidTotal as number)}`]
    : [
        `  Subtotal:  ${money(o.total)}`,
        `  Sales tax: added at checkout by our payment processor`,
        `  TOTAL:  ${money(o.total)} + tax`,
      ];

  const text = [
    DELI.name.toUpperCase(),
    `Order confirmed — thank you, ${firstName}!`,
    ``,
    `We've received your ${o.kind.toLowerCase()} order${paid ? " and payment" : ""}. Here's your receipt.`,
    ``,
    `ORDER ${o.orderId}`,
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }),
    ``,
    ...fulfillment,
    ``,
    `YOUR ORDER`,
    itemLines,
    `  ------------------------------`,
    ...totalBlock,
    ``,
    paid
      ? `A card receipt has also been emailed by our payment processor (Payanywhere).`
      : `Your card receipt with the final total (including tax) comes from our payment processor (Payanywhere).`,
    ``,
    `Questions or a change to your order? Call us at ${DELI.phone} or just reply to this email.`,
    ``,
    `— ${DELI.name}`,
    DELI.address,
    DELI.cityZip,
    DELI.hours,
  ].join("\n");

  return { subject: `Your Brothers Deli order ${o.orderId} — confirmed`, text };
}

// Sends an email TO the customer (replies route back to the deli). Same
// Resend config and not-configured logging as sendDeliEmail.
export async function sendCustomerEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<SendResult> {
  const key = resendKey();
  if (!key) {
    console.log(
      `[email:not-configured] would send CUSTOMER email to ${opts.to}\nSubject: ${opts.subject}\n\n${opts.text}`
    );
    return { sent: false, reason: "no Resend API key (logged instead)" };
  }
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: sender(),
    to: opts.to,
    replyTo: recipient(),
    subject: opts.subject,
    text: opts.text,
  });
  if (error) {
    console.error("[email:error]", error);
    return { sent: false, reason: error.message };
  }
  return { sent: true, id: data?.id };
}

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
