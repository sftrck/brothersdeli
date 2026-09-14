import { NextRequest, NextResponse } from "next/server";
import { findItem } from "@/lib/menu";
import { sendDeliEmail } from "@/lib/email";
import { paymentMode } from "@/lib/payment";

type LineIn = {
  id: string;
  variantLabel?: string;
  qty: number;
  note?: string;
};
type OrderIn = {
  name: string;
  phone: string;
  email?: string;
  pickupTime?: string;
  notes?: string;
  items: LineIn[];
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export async function POST(req: NextRequest) {
  let body: OrderIn;
  try {
    body = (await req.json()) as OrderIn;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const phone = (body.phone || "").trim();
  if (!name || !phone) {
    return NextResponse.json(
      { ok: false, error: "Name and phone are required." },
      { status: 400 }
    );
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Your cart is empty." },
      { status: 400 }
    );
  }

  // Re-price on the server from the canonical menu — never trust client prices.
  const lines: { label: string; qty: number; unit: number; note?: string }[] = [];
  let total = 0;
  for (const l of body.items) {
    const item = findItem(l.id);
    if (!item) continue;
    const qty = Math.max(1, Math.min(50, Math.floor(Number(l.qty) || 1)));
    let unit = item.price ?? 0;
    let label = item.name;
    if (item.variants && item.variants.length) {
      const v =
        item.variants.find((x) => x.label === l.variantLabel) ||
        item.variants[0];
      unit = v.price;
      label = `${item.name} — ${v.label}`;
    }
    total += unit * qty;
    lines.push({ label, qty, unit, note: l.note?.trim() || undefined });
  }

  if (lines.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No valid items in cart." },
      { status: 400 }
    );
  }

  const orderId = `BD-${Date.now().toString(36).toUpperCase()}`;
  const mode = paymentMode();

  const body_lines = lines
    .map(
      (l) =>
        `  ${l.qty} × ${l.label}  ${money(l.unit * l.qty)}` +
        (l.note ? `\n      note: ${l.note}` : "")
    )
    .join("\n");

  const text = [
    `NEW PICKUP ORDER  ${orderId}`,
    ``,
    `Name:   ${name}`,
    `Phone:  ${phone}`,
    body.email ? `Email:  ${body.email}` : ``,
    body.pickupTime ? `Pickup: ${body.pickupTime}` : ``,
    ``,
    `Items:`,
    body_lines,
    ``,
    `Subtotal: ${money(total)}`,
    `(Tax applied at the register.)`,
    ``,
    body.notes ? `Order notes: ${body.notes}` : ``,
    ``,
    mode === "pay_at_pickup"
      ? `Payment: PAY AT PICKUP (POS). Customer has not prepaid.`
      : `Payment: prepaid online.`,
  ]
    .filter(Boolean)
    .join("\n");

  const email = await sendDeliEmail({
    subject: `New pickup order ${orderId} — ${name}`,
    text,
    replyTo: body.email || undefined,
  });

  return NextResponse.json({
    ok: true,
    orderId,
    total,
    mode,
    emailSent: email.sent,
  });
}
