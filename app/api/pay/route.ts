import { NextRequest, NextResponse } from "next/server";
import { paymentMode, createHostedPayment } from "@/lib/payment";
import { oneLine, rateLimited } from "@/lib/security";

type PayIn = {
  orderId: string;
  amount: number;
  description: string;
};

// Creates a Payanywhere hosted-checkout session and returns its URL.
// Until the Payanywhere credentials are set, `configured` is false and the
// caller shows a "payment being connected" state instead of redirecting.
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
    const { checkoutUrl } = await createHostedPayment({
      orderId: oneLine(body.orderId, 40),
      amount,
      description: oneLine(body.description, 140) || "The Brothers Deli",
    });
    return NextResponse.json({ ok: true, configured: true, checkoutUrl });
  } catch (e) {
    // Log the real error server-side; return a generic message to the client.
    console.error("[pay:error]", e);
    return NextResponse.json(
      { ok: false, error: "Couldn't start checkout. Please call the deli." },
      { status: 500 }
    );
  }
}
