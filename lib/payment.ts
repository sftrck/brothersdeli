// Payment integration for Payanywhere / North — EPX Embedded Checkout (Fields).
//
// Payanywhere is North's brand; online card payments run on North's "Online
// Payments" product. We use EPX Embedded Checkout in "Fields" mode so the card
// form is embedded on our own /checkout page (the customer never leaves the
// site) while North iframes the actual card inputs, keeping raw card data off
// our servers (low PCI scope).
//
// Flow (per North's Embedded Checkout — Fields Integration Guide):
//   1. Server creates a short-lived checkout SESSION for the order amount
//      (this file: createCheckoutSession), authenticating with the private API
//      Key + Checkout ID + Profile ID.
//   2. Browser loads North's checkout script, mounts the Fields into our
//      /checkout page, and submits the card to North against that session.
//   3. Server confirms approval via the session status endpoint
//      (getSessionStatus) before we treat the order as paid.
//
// OWNER-PROVIDED (set in Vercel env; from the North Embedded Checkout Designer):
//   NORTH_API_KEY      – private API Key (server-side only, never exposed)
//   NORTH_CHECKOUT_ID  – Checkout ID
//   NORTH_PROFILE_ID   – Profile ID (used by the browser script)
//   NORTH_ENV          – "sandbox" | "production"
//
// STATUS: credential names + flow are final. The exact session endpoint URL,
// script URL, and Fields mount API are account-specific and come from the
// merchant's Fields Integration Guide — the two `TODO(fields-guide)` spots
// below get filled in (and tested in sandbox) once that guide + sandbox
// credentials are available.

export function paymentConfigured(): boolean {
  return Boolean(
    process.env.NORTH_API_KEY &&
      process.env.NORTH_CHECKOUT_ID &&
      process.env.NORTH_PROFILE_ID
  );
}

// Kept for the existing /api/pay gate. "hosted" = North is configured.
export type PaymentMode = "pay_at_pickup" | "hosted";
export function paymentMode(): PaymentMode {
  return paymentConfigured() ? "hosted" : "pay_at_pickup";
}

function apiBase(): string {
  // North sandbox vs production base URL. Confirm exact hosts from the
  // Embedded Checkout Fields Integration Guide for this account.
  return process.env.NORTH_ENV === "production"
    ? "https://api.north.com" // TODO(fields-guide): confirm production base
    : "https://api.sandbox.north.com"; // TODO(fields-guide): confirm sandbox base
}

export type CheckoutSession = {
  sessionId: string;
  profileId: string;
  scriptUrl: string;
  env: string;
};

// Creates a short-lived Embedded Checkout session the browser will attach the
// Fields to. Returns the ids the client needs to mount and submit the form.
export async function createCheckoutSession(_req: {
  orderId: string;
  amount: number; // USD
  description: string;
}): Promise<CheckoutSession> {
  // TODO(fields-guide): POST to North's create-session endpoint with the
  // private API Key + Checkout ID + amount, and return { sessionId } from the
  // response, plus the account's checkout script URL. Endpoint/auth/response
  // shape are in the Fields Integration Guide; wire + test in sandbox first.
  void apiBase();
  throw new Error(
    "North Embedded Checkout not yet wired — needs the account's Fields Integration Guide + sandbox credentials."
  );
}

// Confirms a session was approved before we mark the order paid.
// On approval, the caller should send a "payment collected" email to the deli
// (via lib/email sendDeliEmail) — the itemized order email already went out when
// the order was placed, so this is the second, "money received" notification.
export async function getSessionStatus(
  _sessionId: string
): Promise<{ approved: boolean; authCode?: string }> {
  // TODO(fields-guide): GET the session status endpoint and map North's
  // approval fields to { approved }.
  throw new Error("North session status not yet wired.");
}
