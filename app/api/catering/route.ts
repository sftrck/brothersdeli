import { NextRequest, NextResponse } from "next/server";
import { sendDeliEmail } from "@/lib/email";
import { findCateringItem, CATERING_MIN_HEADCOUNT } from "@/lib/catering";
import { oneLine, multiLine, isEmail, rateLimited } from "@/lib/security";

const MAX_HEADCOUNT = 1000;

type CateringIn = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  eventDate?: string;
  headcount?: number;
  items?: string[];
  details?: string;
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

  const headcount = Math.max(0, Math.floor(Number(body.headcount) || 0));
  if (headcount < CATERING_MIN_HEADCOUNT || headcount > MAX_HEADCOUNT) {
    return NextResponse.json(
      { ok: false, error: `Headcount must be ${CATERING_MIN_HEADCOUNT}–${MAX_HEADCOUNT}.` },
      { status: 400 }
    );
  }

  // Re-price on the server from the canonical catering menu (cap + de-dupe ids).
  const ids = (Array.isArray(body.items) ? body.items : []).slice(0, 100);
  const seen = new Set<string>();
  const chosen = ids
    .map((id) => findCateringItem(String(id)))
    .filter((x): x is NonNullable<typeof x> => {
      if (!x || seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });

  if (chosen.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Select at least one catering item." },
      { status: 400 }
    );
  }

  const perPersonSum = chosen.reduce((s, it) => s + it.perPerson, 0);
  const total = perPersonSum * headcount;

  const inquiryId = `CAT-${Date.now().toString(36).toUpperCase()}`;
  const itemLines = chosen
    .map(
      (it) =>
        `  ${it.name}  ${money(it.perPerson)}/pp × ${headcount} = ${money(
          it.perPerson * headcount
        )}`
    )
    .join("\n");

  const text = [
    `NEW CATERING ORDER  ${inquiryId}`,
    ``,
    `Name:      ${name}`,
    `Email:     ${email}`,
    `Phone:     ${phone}`,
    body.company ? `Company:   ${oneLine(body.company, 120)}` : ``,
    body.eventDate ? `Date:      ${oneLine(body.eventDate, 40)}` : ``,
    `Headcount: ${headcount}`,
    ``,
    `Items:`,
    itemLines,
    ``,
    `Per person: ${money(perPersonSum)}`,
    `ORDER TOTAL: ${money(total)}  (${headcount} people)`,
    `(Tax and delivery not included — confirm at checkout.)`,
    ``,
    body.details ? `Details: ${multiLine(body.details, 1500)}` : ``,
    ``,
    `Payment: customer directed to Payanywhere checkout.`,
    `Reminder: 24 hours' notice, ${CATERING_MIN_HEADCOUNT}-person minimum.`,
  ]
    .filter(Boolean)
    .join("\n");

  const emailRes = await sendDeliEmail({
    subject: `Catering order ${inquiryId} — ${name} (${headcount} ppl, ${money(total)})`,
    text,
    replyTo: email,
  });

  return NextResponse.json({
    ok: true,
    inquiryId,
    total,
    headcount,
    emailSent: emailRes.sent,
  });
}
