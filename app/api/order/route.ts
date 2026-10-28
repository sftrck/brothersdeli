import { NextRequest, NextResponse } from "next/server";
import { findItem, optionAddOn } from "@/lib/menu";
import { sendDeliEmail } from "@/lib/email";
import { paymentMode } from "@/lib/payment";
import { deliveryFee, type DeliveryQuote } from "@/lib/delivery";
import { oneLine, multiLine, isEmail, rateLimited } from "@/lib/security";

const PREP_MINUTES = 25; // prep buffer added to the drive-time delivery estimate

const MAX_LINES = 100;

type ModIn = { optionId: string; label: string };
type LineIn = {
  id: string;
  variantLabel?: string;
  qty: number;
  note?: string;
  forName?: string;
  mods?: ModIn[];
};
type OrderIn = {
  name: string;
  phone: string;
  email?: string;
  pickupTime?: string;
  fulfillment?: "pickup" | "delivery";
  address?: string;
  addressLat?: number;
  addressLng?: number;
  notes?: string;
  items: LineIn[];
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export async function POST(req: NextRequest) {
  if (rateLimited(req)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: OrderIn;
  try {
    body = (await req.json()) as OrderIn;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const name = oneLine(body.name, 120);
  const phone = oneLine(body.phone, 40);
  const email = oneLine(body.email, 254);
  if (!name || !phone) {
    return NextResponse.json(
      { ok: false, error: "Name and phone are required." },
      { status: 400 }
    );
  }
  if (email && !isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
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
  const lines: {
    label: string;
    qty: number;
    unit: number;
    mods?: string[];
    note?: string;
    forName?: string;
  }[] = [];
  let total = 0;
  for (const l of body.items.slice(0, MAX_LINES)) {
    const item = findItem(String(l?.id ?? ""));
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
    // Re-price options/mods from the canonical option definitions.
    const modLabels: string[] = [];
    if (Array.isArray(l.mods) && item.options) {
      for (const m of l.mods.slice(0, 10)) {
        const opt = item.options.find((o) => o.id === m?.optionId);
        if (!opt) continue;
        const choice = opt.choices.find((c) => c.label === m?.label);
        if (!choice) continue;
        unit += choice.price ?? 0;
        modLabels.push(choice.label);
      }
    }
    total += unit * qty;
    lines.push({
      label,
      qty,
      unit,
      mods: modLabels.length ? modLabels : undefined,
      note: oneLine(l.note, 200) || undefined,
      forName: oneLine(l.forName, 60) || undefined,
    });
  }

  if (lines.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No valid items in cart." },
      { status: 400 }
    );
  }

  const orderId = `BD-${Date.now().toString(36).toUpperCase()}`;
  const mode = paymentMode();
  const isDelivery = body.fulfillment === "delivery";

  // Delivery: quote the fee from street distance and an ETA = drive time + prep.
  const itemsSubtotal = total;
  let delivery: DeliveryQuote | null = null;
  let etaText = "";
  if (isDelivery) {
    const coords =
      Number.isFinite(body.addressLat) && Number.isFinite(body.addressLng)
        ? { lat: Number(body.addressLat), lng: Number(body.addressLng) }
        : undefined;
    delivery = await deliveryFee(oneLine(body.address, 300), coords);
    total += delivery.fee;
    if (delivery.durationMin != null) {
      const etaMin = delivery.durationMin + PREP_MINUTES;
      const when = new Date(Date.now() + etaMin * 60000).toLocaleTimeString(
        "en-US",
        { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit" }
      );
      etaText = `~${etaMin} min (around ${when})`;
    } else {
      etaText = "the deli will confirm your delivery time";
    }
  }

  const body_lines = lines
    .map(
      (l) =>
        `  ${l.qty} × ${l.label}  ${money(l.unit * l.qty)}` +
        (l.mods && l.mods.length ? `\n      ${l.mods.join(", ")}` : "") +
        (l.forName ? `\n      for: ${l.forName}` : "") +
        (l.note ? `\n      note: ${l.note}` : "")
    )
    .join("\n");

  const text = [
    `THE BROTHERS DELI — ${isDelivery ? "DELIVERY" : "PICKUP"} ORDER`,
    `${orderId} · ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}`,
    ``,
    `BILL TO`,
    `  ${name}`,
    `  ${phone}${email ? ` · ${email}` : ""}`,
    ``,
    `FULFILLMENT`,
    isDelivery ? `  DELIVERY` : `  Pickup — skyway counter, Suite #220`,
    isDelivery && body.address ? `  Address: ${multiLine(body.address, 300)}` : ``,
    isDelivery
      ? `  Est. delivery: ${etaText}${delivery && delivery.miles != null ? ` · ${delivery.miles} mi` : ""}`
      : body.pickupTime
        ? `  Time: ${oneLine(body.pickupTime, 60)}`
        : ``,
    isDelivery && delivery && !delivery.calculated
      ? `  (!) Couldn't auto-calc the delivery distance — verify the fee and time.`
      : ``,
    ``,
    `ITEMS`,
    body_lines,
    ``,
    `  ------------------------------`,
    isDelivery
      ? `  Items subtotal:  ${money(itemsSubtotal)}`
      : `  SUBTOTAL:  ${money(itemsSubtotal)}`,
    isDelivery && delivery
      ? `  Delivery fee:    ${money(delivery.fee)}${delivery.calculated ? "" : " (estimate)"}`
      : ``,
    isDelivery ? `  ORDER TOTAL:     ${money(total)}` : ``,
    isDelivery
      ? `  (Tax applied by the deli.)`
      : `  (Tax applied at the register.)`,
    ``,
    body.notes ? `Order notes: ${multiLine(body.notes, 500)}` : ``,
    ``,
    mode === "hosted"
      ? `Payment: via Payanywhere checkout.`
      : `Payment: Payanywhere checkout (being connected — confirm payment with customer).`,
  ]
    .filter(Boolean)
    .join("\n");

  const emailRes = await sendDeliEmail({
    subject: `New ${isDelivery ? "delivery" : "pickup"} order ${orderId} — ${name}`,
    text,
    replyTo: email || undefined,
  });

  return NextResponse.json({
    ok: true,
    orderId,
    total,
    mode,
    deliveryFee: delivery?.fee ?? 0,
    deliveryMiles: delivery?.miles,
    deliveryEta: etaText || undefined,
    deliveryCalculated: delivery?.calculated ?? true,
    emailSent: emailRes.sent,
  });
}
