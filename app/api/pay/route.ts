import { NextRequest, NextResponse } from "next/server";
import { paymentMode, createCheckoutSession } from "@/lib/payment";
import { oneLine, rateLimited } from "@/lib/security";

type PayIn = {
  orderId: string;
  amount: number;
  description: string;
};

// Starts a North Embedded Checkout session for the order. Until North is
// configured, `configured` is false and the checkout page shows a
// "payment being connected" state instead of the card form.
export async function POST(req: NextRequest) {
  if (rateLimited(req)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: PayIn;
  try {
    body = (await req.json()) as PayIn;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  if (paymentMode() !== "hosted") {
    return NextResponse.json({ ok: true, configured: false });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
    return NextResponse.json(
      { ok: false, error: "Invalid amount." },
      { status: 400 }
    );
  }

  try {
    const session = await createCheckoutSession({
      orderId: oneLine(body.orderId, 40),
      amount,
      description: oneLine(body.description, 140) || "The Brothers Deli",
    });
    // The browser uses these to mount North's Fields on the checkout page.
    return NextResponse.json({ ok: true, configured: true, session });
  } catch (e) {
    console.error("[pay:error]", e);
    return NextResponse.json(
      { ok: false, error: "Couldn't start checkout. Please call the deli." },
      { status: 500 }
    );
  }
}
