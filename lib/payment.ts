// Payment integration seam for Payanywhere (North / NAB).
//
// Payanywhere is primarily an in-person POS. Its online path is a HOSTED
// PAYMENT PAGE / iFrame (the North "Gateway Invoicing" API), which returns a
// tokenized transaction to the site — there is no full native cart/checkout API.
//
// This module isolates that handoff so the rest of the app never touches
// payment details. Until the owner provides the North gateway credentials,
// `mode` is "pay_at_pickup": the customer places the order online and pays at
// the skyway POS on pickup. This keeps the ordering funnel fully working today.
//
// TO ENABLE ONLINE PREPAYMENT (owner-provided, in Vercel env):
//   PAYANYWHERE_GATEWAY_URL   – North hosted-payment / invoicing endpoint
//   PAYANYWHERE_API_KEY       – gateway API key
//   PAYANYWHERE_MERCHANT_ID   – merchant / MID
// Then implement `createHostedPayment()` below against the account's API docs
// (the exact call shape depends on what the merchant account has enabled) and
// return the hosted checkout URL to redirect the customer to.

export type PaymentMode = "pay_at_pickup" | "hosted";

export function paymentMode(): PaymentMode {
  return process.env.PAYANYWHERE_API_KEY ? "hosted" : "pay_at_pickup";
}

export type HostedPaymentRequest = {
  orderId: string;
  amount: number; // USD
  description: string;
};

// Placeholder for the hosted-payment handoff. Wire against the North gateway
// once credentials are in place; today this path is unused (mode is pickup).
export async function createHostedPayment(
  _req: HostedPaymentRequest
): Promise<{ checkoutUrl: string }> {
  throw new Error(
    "Payanywhere hosted payment not yet configured. Set PAYANYWHERE_* env vars and implement createHostedPayment()."
  );
}
