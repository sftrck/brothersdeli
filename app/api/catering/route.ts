import { NextRequest, NextResponse } from "next/server";
import { sendDeliEmail } from "@/lib/email";
import { findCateringItem, CATERING_MIN_HEADCOUNT } from "@/lib/catering";
import { deliveryFee, type DeliveryQuote } from "@/lib/delivery";
import { oneLine, multiLine, isEmail, rateLimited } from "@/lib/security";

const MAX_HEADCOUNT = 1000;
const GF_PER_PERSON = 2;

type ItemIn = { id: string; choices?: Record<string, string> };
type CateringIn = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  eventDate?: string;
  headcount?: number;
  items?: ItemIn[];
  fulfillment?: "pickup" | "delivery";
  address?: string;
  vegCount?: number;
  gfCount?: number;
  utensils?: boolean;
  details?: string;
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}
function count(v: unknown, max = MAX_HEADCOUNT) {
  return Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
}

export async function POST(req: NextRequest) {
  if (rateLimited(req)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: CateringIn;
  try {
    body = (await req.json()) as CateringIn;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const name = oneLine(body.name, 120);
  const email = oneLine(body.email, 254);
  const phone = oneLine(body.phone, 40);
  if (!name || !email || !phone) {
    return NextResponse.json(
      { ok: false, error: "Name, email, and phone are required." },
      { status: 400 }
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 400 }
    );
  }

  const headcount = count(body.headcount);
  if (headcount < CATERING_MIN_HEADCOUNT) {
    return NextResponse.json(
      { ok: false, error: `Headcount must be at least ${CATERING_MIN_HEADCOUNT}.` },
      { status: 400 }
    );
  }

  const isDelivery = body.fulfillment === "delivery";
  const address = oneLine(body.address, 300);
  if (isDelivery && !address) {
    return NextResponse.json(
      { ok: false, error: "A delivery address is required." },
      { status: 400 }
    );
  }

  // Re-price from the canonical menu; validate each tray's choice (cap + de-dupe).
  const rawItems = (Array.isArray(body.items) ? body.items : []).slice(0, 100);
  const seen = new Set<string>();
  const chosen: { name: string; perPerson: number; choice?: string }[] = [];
  for (const raw of rawItems) {
    const it = findCateringItem(String(raw?.id ?? ""));
    if (!it || seen.has(it.id)) continue;
    seen.add(it.id);
    let choice: string | undefined;
    if (it.chooses) {
      choice = it.chooses
        .map((c) => {
          const picked = oneLine(raw?.choices?.[c.id], 60);
          return c.options.includes(picked) ? picked : c.options[0];
        })
        .join(", ");
    }
    chosen.push({ name: it.name, perPerson: it.perPerson, choice });
  }
  if (chosen.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Select at least one catering item." },
      { status: 400 }
    );
  }

  const vegCount = count(body.vegCount, headcount);
  const gfCount = count(body.gfCount, headcount);
  const utensils = Boolean(body.utensils);

  const perPersonSum = chosen.reduce((s, it) => s + it.perPerson, 0);
  const foodTotal = perPersonSum * headcount;
  const gfUpcharge = gfCount * GF_PER_PERSON;

  let delivery: DeliveryQuote = { fee: 0, calculated: true };
  if (isDelivery) {
    delivery = await deliveryFee(address);
  }
  const total = foodTotal + gfUpcharge + delivery.fee;

  const inquiryId = `CAT-${Date.now().toString(36).toUpperCase()}`;

  // ---- Checkout display lines ----
  const lines: { name: string; detail?: string; amount: number }[] = chosen.map(
    (it) => ({
      name: it.name + (it.choice ? ` — ${it.choice}` : ""),
      detail: `${money(it.perPerson)}/pp × ${headcount}`,
      amount: it.perPerson * headcount,
    })
  );
  if (gfUpcharge > 0) {
    lines.push({
      name: "Gluten-free upcharge",
      detail: `${money(GF_PER_PERSON)} × ${gfCount}`,
      amount: gfUpcharge,
    });
  }
  if (isDelivery) {
    lines.push({
      name: "Delivery" + (delivery.miles != null ? ` (${delivery.miles} mi)` : ""),
      detail: delivery.calculated ? undefined : "estimated — deli will confirm",
      amount: delivery.fee,
    });
  }

  // ---- Invoice-style email to the deli ----
  const itemLines = chosen
    .map(
      (it) =>
        `  ${it.name}${it.choice ? ` — ${it.choice}` : ""}\n` +
        `      ${money(it.perPerson)}/pp × ${headcount} = ${money(it.perPerson * headcount)}`
    )
    .join("\n");

  const text = [
    `THE BROTHERS DELI — CATERING ORDER`,
    `${inquiryId} · ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}`,
    ``,
    `BILL TO`,
    `  ${name}${body.company ? ` · ${oneLine(body.company, 120)}` : ""}`,
    `  ${email} · ${phone}`,
    ``,
    `EVENT`,
    body.eventDate ? `  Date: ${oneLine(body.eventDate, 40)}` : ``,
    `  Headcount: ${headcount}`,
    `  Fulfillment: ${isDelivery ? `DELIVERY to ${address}` : "Pickup — skyway counter, Suite #220"}`,
    isDelivery && delivery.miles != null ? `  Distance: ${delivery.miles} mi` : ``,
    isDelivery && !delivery.calculated ? `  (!) Delivery distance couldn't be auto-calculated — please verify.` : ``,
    vegCount > 0 ? `  Vegetarian: ${vegCount} people` : ``,
    gfCount > 0 ? `  Gluten-free: ${gfCount} people` : ``,
    `  Serving utensils / plates: ${utensils ? "YES" : "No"}`,
    ``,
    `ITEMS`,
    itemLines,
    ``,
    `  Food subtotal:        ${money(foodTotal)}`,
    gfUpcharge > 0 ? `  Gluten-free upcharge: ${money(gfUpcharge)}  (${money(GF_PER_PERSON)} × ${gfCount})` : ``,
    isDelivery ? `  Delivery fee:         ${money(delivery.fee)}${delivery.calculated ? "" : " (estimate)"}` : ``,
    `  ------------------------------`,
    `  ORDER TOTAL:          ${money(total)}`,
    `  (Tax not included.)`,
    ``,
    body.details ? `Details: ${multiLine(body.details, 1500)}` : ``,
    ``,
    `Payment: customer directed to Payanywhere checkout.`,
    `Reminder: 24 hours' notice, ${CATERING_MIN_HEADCOUNT}-person minimum.`,
  ]
    .filter(Boolean)
    .join("\n");

  const emailRes = await sendDeliEmail({
    subject: `Catering ${inquiryId} — ${name} (${headcount} ppl, ${money(total)})`,
    text,
    replyTo: email,
  });

  return NextResponse.json({
    ok: true,
    inquiryId,
    total,
    headcount,
    lines,
    deliveryCalculated: delivery.calculated,
    emailSent: emailRes.sent,
  });
}
