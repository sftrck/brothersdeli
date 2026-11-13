// Payment integration for Payanywhere / North — EPX Embedded Checkout (Fields).
//
// Payanywhere is North's brand; online card payments run on North's "Online
// Payments" product. We use EPX Embedded Checkout in "Fields" mode so the card
// form is embedded on our own /checkout page (the customer never leaves the
// site) while North iframes the actual card inputs, keeping raw card data off
// our servers (low PCI scope).
//
// Flow (North's Embedded Checkout — Fields Integration Guide):
//   1. Server creates a short-lived checkout SESSION for the order amount
//      (createCheckoutSession), authenticating with the private API Key.
//   2. Browser loads https://checkout.north.com/checkout.js, mounts the Fields,
//      and submits the card to North against that session token.
//   3. Server confirms approval via the session STATUS endpoint
//      (getSessionStatus) before we treat the order as paid, then emails.
//
// OWNER-PROVIDED (Vercel env; from the North Embedded Checkout dashboard):
//   NORTH_API_KEY      – private API Key (server-side only, never exposed)
//   NORTH_CHECKOUT_ID  – Checkout ID
//   NORTH_PROFILE_ID   – merchant Profile ID
//   NORTH_ENV          – "sandbox" | "production"
//
// Sandbox and production use the SAME host; whether a charge actually funds is
// determined by the checkout being published and the merchant assigned to it.

// Same host for sandbox and production (per North's Fields guide + sample).
const NORTH_BASE = "https://checkout.north.com";
export const NORTH_SCRIPT_URL = `${NORTH_BASE}/checkout.js`;

function apiKey() {
  return process.env.NORTH_API_KEY || "";
}
function checkoutId() {
  return process.env.NORTH_CHECKOUT_ID || "";
}
function profileId() {
  return process.env.NORTH_PROFILE_ID || "";
}
function northEnv() {
  return (process.env.NORTH_ENV || "sandbox").toLowerCase();
}

export function paymentConfigured(): boolean {
  return Boolean(apiKey() && checkoutId() && profileId());
}

// Embedded checkout is shown whenever North is configured (per owner: open to
// everyone). NOTE: with SANDBOX credentials this accepts test cards only — swap
// to production credentials (real MID) before real customers pay.
export function embeddedEnabled(): boolean {
  return paymentConfigured();
}

// "hosted" = North embedded checkout is live here; else the interim link.
export type PaymentMode = "pay_at_pickup" | "hosted";
export function paymentMode(): PaymentMode {
  return paymentConfigured() ? "hosted" : "pay_at_pickup";
}

// What the browser needs to mount North's Fields on /checkout.
export type CheckoutSession = {
  token: string;
  scriptUrl: string;
  env: string;
};

type ProductIn = { name: string; price: number; quantity: number };

// Step 2 — create a short-lived Embedded Checkout session for this order.
export async function createCheckoutSession(req: {
  orderId: string;
  amount: number; // USD, pre-tax (North adds tax at payment)
  description: string;
  products?: ProductIn[];
}): Promise<CheckoutSession> {
  const key = apiKey();
  if (!key || !checkoutId() || !profileId()) {
    throw new Error("North credentials are not configured.");
  }

  const body = JSON.stringify({
    checkoutId: checkoutId(),
    profileId: profileId(),
    amount: req.amount,
    products:
      req.products && req.products.length
        ? req.products
        : [{ name: req.description, price: req.amount, quantity: 1 }],
  });

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30_000);
  let res: Response;
  try {
    res = await fetch(`${NORTH_BASE}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "Accept-Language": "en",
        "User-Agent": "The Brothers Deli",
      },
      body,
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`North session HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  let token = "";
  try {
    token = (JSON.parse(text) as { token?: string }).token || "";
  } catch {
    /* fall through */
  }
  if (!token) throw new Error("North session response had no token.");

  return { token, scriptUrl: NORTH_SCRIPT_URL, env: northEnv() };
}

// Step 6 — authoritative approval check (server-side only). On approval the
// caller sends the customer receipt + an internal "payment collected" email.
export async function getSessionStatus(sessionToken: string): Promise<{
  approved: boolean;
  status?: string;
  amount?: number;
  body?: unknown;
}> {
  const key = apiKey();
  if (!key) throw new Error("North credentials are not configured.");

  const doFetch = async () => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20_000);
    try {
      const res = await fetch(`${NORTH_BASE}/api/sessions/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${key}`,
          SessionToken: sessionToken,
          CheckoutId: checkoutId(),
          ProfileId: profileId(),
          "Accept-Language": "en",
          "User-Agent": "The Brothers Deli",
        },
        signal: ctrl.signal,
      });
      return { ok: res.ok, httpStatus: res.status, text: await res.text() };
    } finally {
      clearTimeout(t);
    }
  };

  // The session status can take a few seconds to be queryable after payment,
  // so retry until we see a final (Approved/Declined) result.
  let last = { ok: false, httpStatus: 0, text: "" };
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1200));
    try {
      last = await doFetch();
    } catch (e) {
      last = { ok: false, httpStatus: 0, text: e instanceof Error ? e.message : "error" };
      continue;
    }
    if (!last.ok) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(last.text);
    } catch {
      parsed = undefined;
    }
    const obj = (parsed ?? {}) as Record<string, unknown>;
    const status = String(obj.status ?? "").trim();
    const low = status.toLowerCase();
    if (low !== "approved" && low !== "declined") continue; // still pending
    let amount: number | undefined;
    const bodyObj = (obj.body ?? obj) as Record<string, unknown>;
    for (const field of ["amount", "totalAmount", "authAmount", "AUTH_AMOUNT"]) {
      const v = bodyObj?.[field];
      const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
      if (Number.isFinite(n) && n > 0) {
        amount = n;
        break;
      }
    }
    return { approved: low === "approved", status, amount, body: parsed };
  }
  throw new Error(
    `North status not final after retries: HTTP ${last.httpStatus}: ${String(last.text).slice(0, 200)}`
  );
}
