import { NextRequest, NextResponse } from "next/server";
import { sendDeliEmail } from "@/lib/email";

// Receives payment notifications from Payanywhere / Payments Hub.
//
// Point the Payments Hub webhook at:
//   https://<your-domain>/api/webhooks/payanywhere?key=<PAYANYWHERE_WEBHOOK_SECRET>
//
// Auth: a shared secret in the `key` query param, matched against the
// PAYANYWHERE_WEBHOOK_SECRET env var, so random POSTs are rejected. If
// Payanywhere signs webhooks (HMAC header), we'll switch to verifying that
// signature once we have the signing secret + header name from their docs
// — see TODO(webhook-auth).
//
// On a payment event we email the deli a "payment collected" notice. Note the
// open-amount payment link doesn't carry our order id, so the team reconciles
// the amount against the itemized order email that was sent when the order was
// placed.

function pickAmount(o: Record<string, unknown>): string | null {
  for (const k of ["amount", "total", "totalAmount", "transactionAmount", "amt"]) {
    const v = o[k];
    if (typeof v === "number") return `$${v.toFixed(2)}`;
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.PAYANYWHERE_WEBHOOK_SECRET;
  const key = req.nextUrl.searchParams.get("key");
  // TODO(webhook-auth): replace the shared-secret check with Payanywhere's
  // signature verification once we have their signing scheme.
  if (!secret || key !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    // Some providers post form-encoded; capture raw as a fallback.
    try {
      const text = await req.text();
      payload = { raw: text.slice(0, 4000) };
    } catch {
      /* ignore */
    }
  }

  const amount = pickAmount(payload);
  const text = [
    `PAYMENT COLLECTED${amount ? ` — ${amount}` : ""}`,
    ``,
    `A payment was recorded on the Payanywhere payment link.`,
    `Match it to the order email with the same total.`,
    ``,
    `Details:`,
    JSON.stringify(payload, null, 2).slice(0, 3500),
  ].join("\n");

  await sendDeliEmail({
    subject: `Payment collected${amount ? ` — ${amount}` : ""} · The Brothers Deli`,
    text,
  });

  // Always 200 so the provider doesn't retry a delivered event.
  return NextResponse.json({ ok: true });
}

// Some providers verify the endpoint with a GET first.
export async function GET() {
  return NextResponse.json({ ok: true });
}
