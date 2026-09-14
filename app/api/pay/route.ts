import { NextRequest, NextResponse } from "next/server";
import { paymentMode, createHostedPayment } from "@/lib/payment";

type PayIn = {
  orderId: string;
  amount: number;
  description: string;
};

// Creates a Payanywhere hosted-checkout session and returns its URL.
// Until the Payanywhere credentials are set, `configured` is false and the
// caller shows a "payment being connected" state instead of redirecting.
export async function POST(req: NextRequest) {
  let body: PayIn;
  try {
    body = (await req.json()) as PayIn;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  if (paymentMode() !== "hosted") {
    return NextResponse.json({ ok: true, configured: false });
  }

  try {
    const { checkoutUrl } = await createHostedPayment({
      orderId: body.orderId,
      amount: Number(body.amount) || 0,
      description: body.description || "The Brothers Deli",
    });
    return NextResponse.json({ ok: true, configured: true, checkoutUrl });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Payment error" },
      { status: 500 }
    );
  }
}
