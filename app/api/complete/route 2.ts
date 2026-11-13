import { NextRequest, NextResponse } from "next/server";
import { getSessionStatus } from "@/lib/payment";
import {
  buildCustomerReceipt,
  sendCustomerEmail,
  sendDeliEmail,
  type ReceiptLine,
} from "@/lib/email";
import { oneLine, isEmail, rateLimited } from "@/lib/security";

type OrderIn = {
  orderId?: string;
  type?: string; // Pickup | Delivery | Catering
  total?: number;
  headcount?: number;
  lines?: ReceiptLine[];
  contact?: { name?: string; email?: string; phone?: string };
  pickupTime?: string;
  address?: string;
  deliveryEta?: string;
  deliveryNotes?: string;
  eventDate?: string;
};
type CompleteIn = { token?: string; order?: OrderIn };

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

// Confirms a North Embedded Checkout payment server-side (authoritative), then
// emails the customer their receipt and the deli a "payment collected" note.
// The itemized order email already went out when the order was placed.
export async function POST(req: NextRequest) {
  if (rateLimited(req)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: CompleteIn;
  try {
    body = (await req.json()) as CompleteIn;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const token = oneLine(body.token, 400);
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Missing session token." },
      { status: 400 }
    );
  }

  let verified;
  try {
    verified = await getSessionStatus(token);
  } catch (e) {
    console.error("[complete:status-error]", e);
    return NextResponse.json(
      { ok: false, error: "Couldn't verify the payment. Please call the deli." },
      { status: 502 }
    );
  }

  if (!verified.approved) {
    return NextResponse.json({
      ok: true,
      approved: false,
      status: verified.status ?? "Not approved",
    });
  }

  // ---- Payment approved: send the two confirmation emails ----
  const o = body.order ?? {};
  const orderId = oneLine(o.orderId, 40) || "(unknown)";
  const kindRaw = oneLine(o.type, 20);
  const kind: "Pickup" | "Delivery" | "Catering" =
    kindRaw === "Catering" ? "Catering" : kindRaw === "Delivery" ? "Delivery" : "Pickup";
  const total = Number(o.total) || 0;
  const paidTotal = verified.amount; // North's taxed total, when provided
  const lines = Array.isArray(o.lines) ? o.lines.slice(0, 100) : [];
  const name = oneLine(o.contact?.name, 120) || "there";
  const email = oneLine(o.contact?.email, 254);

  // Internal "payment collected" note to the deli.
  const deliRes = await sendDeliEmail({
    subject: `PAID — ${kind} ${orderId} (${money(paidTotal ?? total)})`,
    text: [
      `Payment received for ${kind} order ${orderId}.`,
      ``,
      `Customer: ${name}${email ? ` · ${email}` : ""}`,
      paidTotal != null
        ? `Amount charged (incl. tax): ${money(paidTotal)}`
        : `Order total (pre-tax): ${money(total)} (+ tax at card)`,
      ``,
      `The itemized order was emailed when it was placed.`,
    ].join("\n"),
  });

  // Customer receipt (only if we have their email).
  let customerSent = false;
  if (email && isEmail(email)) {
    const { subject, text } = buildCustomerReceipt({
      orderId,
      kind,
      name,
      lines,
      total,
      paidTotal,
      pickupTime: oneLine(o.pickupTime, 60) || undefined,
      address: oneLine(o.address, 300) || undefined,
      deliveryEta: oneLine(o.deliveryEta, 120) || undefined,
      deliveryNotes: oneLine(o.deliveryNotes, 400) || undefined,
      headcount: o.headcount,
      eventDate: oneLine(o.eventDate, 40) || undefined,
    });
    const r = await sendCustomerEmail({ to: email, subject, text });
    customerSent = r.sent;
  }

  return NextResponse.json({
    ok: true,
    approved: true,
    emailedCustomer: customerSent,
    emailedDeli: deliRes.sent,
  });
}
