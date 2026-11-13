"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

type CheckoutLine = { name: string; detail?: string; amount: number };
type PendingOrder = {
  type: string;
  orderId: string;
  headcount?: number;
  total: number;
  lines: CheckoutLine[];
  contact?: { name?: string; email?: string; phone?: string };
  pickupTime?: string;
  address?: string;
  deliveryEta?: string;
  deliveryNotes?: string;
  eventDate?: string;
};
type NorthSession = { token: string; scriptUrl: string; env: string };
type NorthCheckout = {
  mount: (token: string, elementId: string) => Promise<void>;
  submit: () => Promise<unknown>;
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

// Interim: Payanywhere "Website Payment Link" (open-amount hosted page), used
// until North Embedded Checkout is live in production.
// Override in Vercel with NEXT_PUBLIC_PAYANYWHERE_PAYMENT_LINK if it's rotated.
const PAYMENT_LINK =
  process.env.NEXT_PUBLIC_PAYANYWHERE_PAYMENT_LINK ||
  "https://pymntlink.com/payment-link?token=MGUxNDM0YjE5MmM4ZmE3NjljZGE1MDA1Y2MxMTI0Zjg6NzM2YzQwZjRjMzJlMWNlZGM5MjBhYjE2Zjg5ZGMyOTcwYjViZThhZGI2NGQ3ZTkyZDdmMjgwZGVkNDU5ZTJmOGJkZGM1NTM5Nzg4OGM3NGJmYmZkOGRmZTVmMDQzYjU5YjU4MTE4YWIzOGFhOWZmZjBiNjEwYzNmY2U1MTc3Zjg0NmI0NTZmZWQwMmQ1ZDEwZmRmMDUxZThlOGExNmNjZDRkZDA3MDUyYzVjZWNjNTk0NjEzNmFjNGJkNzIyNTY1M2U1NTk1MjQ4ZmIwMzg1YzE1MmMzMDA4YTVmMTQyYTExNjcxYmNkZTk1NmZhNTFkYzU4NDA4NWZkZjVlZDY1ZThlYjUzYTVkMDAyZjM3NTY2ZDkwZmQ3MzMxODlkYzRlNzllMzNjYmU1YmEyMmVlYmZhYTU1M2Q2MDUyODk4YWQ3NDdkZjg4YjcxYzcwNTIzM2Q5ZmVmYTBhNjE5MDgzMmFlMGEwNzg1ZjEyYTBhYWFkNzI1NDAzOGUzOWEyODli";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { checkout?: NorthCheckout };
    if (w.checkout) return resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("load failed")));
      if (w.checkout) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load checkout.js"));
    document.head.appendChild(s);
  });
}

export default function CheckoutPage() {
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [pending, setPending] = useState(false);
  const [linkPay, setLinkPay] = useState(false);
  const [approved, setApproved] = useState(false);
  const [session, setSession] = useState<NorthSession | null>(null);
  const [fieldsReady, setFieldsReady] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [useInterim, setUseInterim] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bd_checkout");
      if (raw) setOrder(JSON.parse(raw) as PendingOrder);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // Mount North's card fields once we have a session.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      try {
        await loadScript(session.scriptUrl);
        const w = window as unknown as { checkout?: NorthCheckout };
        if (!w.checkout || typeof w.checkout.mount !== "function") {
          throw new Error("checkout.js not ready");
        }
        await w.checkout.mount(session.token, "north-fields");
        if (!cancelled) setFieldsReady(true);
      } catch (e) {
        console.error("[checkout:mount]", e);
        if (!cancelled)
          setError(
            "Couldn't load the secure card form. Please try again, or call (612) 314-8007."
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  function clearSaved() {
    try {
      sessionStorage.removeItem("bd_checkout");
      localStorage.removeItem(order?.type === "Catering" ? "bd_catering" : "bd_cart");
    } catch {
      /* ignore */
    }
  }

  // As soon as the order loads (customer arrives here from "Continue to
  // Checkout" / "Complete Catering Purchase"), bring up the card form — create
  // an embedded session, or fall back to the interim payment-link button.
  useEffect(() => {
    if (!loaded || !order) return;
    if (session || linkPay || pending || approved || useInterim || preparing) return;
    prepare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, order]);

  async function prepare() {
    if (!order) return;
    setPreparing(true);
    setError("");
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          amount: order.total,
          description: `${order.type} order ${order.orderId} — The Brothers Deli`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.configured && data.session) {
        setSession(data.session as NorthSession); // card form mounts (effect)
      } else if (PAYMENT_LINK) {
        setUseInterim(true); // show the interim "Pay" button (popup needs a click)
        if (!res.ok || !data.ok) setError(data.error || "");
      } else if (res.ok && data.ok) {
        setPending(true);
        clearSaved();
      } else {
        setError(data.error || "Couldn't start checkout. Please call the deli.");
      }
    } catch {
      if (PAYMENT_LINK) setUseInterim(true);
      else setError("Network error. Please call (612) 314-8007 to finish your order.");
    } finally {
      setPreparing(false);
    }
  }

  // Interim fallback: open the Payanywhere payment link (needs a user click so
  // the popup isn't blocked).
  function startInterim() {
    if (!PAYMENT_LINK) return;
    window.open(PAYMENT_LINK, "_blank", "noopener,noreferrer");
    setLinkPay(true);
  }

  // Step 2: submit the card, then verify + fulfill server-side.
  async function submitCard() {
    if (!session || !order) return;
    setError("");
    setPaying(true);
    try {
      const w = window as unknown as { checkout?: NorthCheckout };
      if (!w.checkout) throw new Error("checkout.js missing");
      await w.checkout.submit();
      const res = await fetch("/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: session.token, order }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Payment couldn't be verified. Please call the deli.");
        return;
      }
      if (data.approved) {
        clearSaved();
        setApproved(true);
      } else {
        setError(
          `Payment ${data.status || "was not approved"}. Please check your card details and try again.`
        );
      }
    } catch (e) {
      console.error("[checkout:submit]", e);
      setError("Payment didn't go through. Please check your card details and try again.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <div className="page-intro">
        <div className="wrap">
          <p className="eyebrow">Checkout</p>
          <h1>Complete Your Order</h1>
        </div>
      </div>

      <div className="wrap" style={{ paddingBlock: 48, maxWidth: 640 }}>
        {!loaded ? null : approved ? (
          <div className="confirm" style={{ margin: 0 }}>
            <div className="tick">✓</div>
            <h2>Payment Received</h2>
            <p>
              Thanks! Your {order?.type.toLowerCase()} order{" "}
              <span className="oid">{order?.orderId}</span> is paid and sent to
              the deli. A receipt is on its way to your email.
            </p>
            <p style={{ marginTop: 18 }}>
              <Link className="btn btn-ghost" href="/">
                Back to home
              </Link>
            </p>
          </div>
        ) : session ? (
          <div className="checkout-card">
            <div className="co-head">
              <span className="co-type">{order?.type} order</span>
              <span className="co-id">{order?.orderId}</span>
            </div>
            <div className="co-total" style={{ marginTop: 12 }}>
              <span>Total (before tax)</span>
              <span>{order ? money(order.total) : ""}</span>
            </div>
            <div id="north-fields" style={{ marginTop: 18, minHeight: 60 }} />
            {!fieldsReady && !error && (
              <p style={{ color: "var(--ink-soft)", fontSize: ".9rem" }}>
                Loading secure card form…
              </p>
            )}
            {error && <div className="form-err">{error}</div>}
            <button
              className="submit-btn"
              onClick={submitCard}
              disabled={paying || !fieldsReady}
            >
              {paying ? "Processing…" : `Pay ${order ? money(order.total) : ""} + tax`}
            </button>
            <p className="co-secure">
              Secure card payment powered by Payanywhere · North. Sales tax is
              added at payment.
            </p>
          </div>
        ) : linkPay ? (
          <div className="checkout-card" style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--display)", textTransform: "uppercase", color: "var(--green-deep)", fontSize: "1.6rem" }}>
              Finish Your Payment
            </h2>
            <p style={{ color: "var(--ink-soft)", marginTop: 10 }}>
              A secure Payanywhere payment page opened in a new tab. Enter this
              exact amount to pay for order{" "}
              <span className="oid">{order?.orderId}</span>:
            </p>
            <div
              style={{
                fontFamily: "var(--display)",
                fontSize: "2.8rem",
                color: "var(--green-deep)",
                margin: "16px 0 6px",
              }}
            >
              {order ? money(order.total) : ""}
            </div>
            <p style={{ fontSize: ".85rem", color: "var(--ink-soft)" }}>
              Your order is already sent to the deli. Please enter the amount
              above exactly.
            </p>
            <p style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                className="btn btn-primary"
                href={PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Payment Page
              </a>
              <Link className="btn btn-ghost" href="/">
                Back to Home
              </Link>
            </p>
            <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", marginTop: 14 }}>
              Trouble paying? Call <a href="tel:16123148007">(612) 314-8007</a>.
            </p>
          </div>
        ) : pending ? (
          <div className="confirm" style={{ margin: 0 }}>
            <div className="tick">✓</div>
            <h2>Order Received</h2>
            <p>
              Your {order?.type.toLowerCase()} order{" "}
              <span className="oid">{order?.orderId}</span> is in
              {order?.headcount ? ` for ${order.headcount} people` : ""}.
            </p>
            <p>
              Card payment is being connected — the deli will call to confirm the
              details and take payment. For anything urgent, call{" "}
              <a href="tel:16123148007">(612) 314-8007</a>.
            </p>
            <p style={{ marginTop: 18 }}>
              <Link className="btn btn-ghost" href="/">
                Back to home
              </Link>
            </p>
          </div>
        ) : !order ? (
          <div className="confirm" style={{ margin: 0 }}>
            <h2>Nothing to Check Out</h2>
            <p>Start an order and it&apos;ll show up here.</p>
            <p style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/order">
                Order Now
              </Link>
              <Link className="btn btn-ghost" href="/catering">
                Catering
              </Link>
            </p>
          </div>
        ) : (
          <div className="checkout-card">
            <div className="co-head">
              <span className="co-type">{order.type} order</span>
              <span className="co-id">{order.orderId}</span>
            </div>
            {order.headcount ? (
              <p className="co-heads">{order.headcount} people</p>
            ) : null}

            <div className="co-lines">
              {order.lines.map((l, i) => (
                <div className="co-line" key={i}>
                  <span>
                    {l.name}
                    {l.detail ? <span className="co-detail"> · {l.detail}</span> : null}
                  </span>
                  <span>{money(l.amount)}</span>
                </div>
              ))}
            </div>

            <div className="co-total">
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
            <p className="co-note">
              Total shown is before sales tax. Tax is added at payment — your
              card receipt shows the final total, including tax.
            </p>

            {error && <div className="form-err">{error}</div>}

            <button
              className="submit-btn"
              onClick={startInterim}
              disabled={preparing || paying}
            >
              {preparing
                ? "Preparing secure checkout…"
                : `Pay with Payanywhere · ${money(order.total)}`}
            </button>
            <p className="co-secure">Secure card checkout powered by Payanywhere.</p>
            <p style={{ textAlign: "center", marginTop: 12 }}>
              <Link
                href={order.type === "Catering" ? "/catering" : "/order"}
                style={{ color: "var(--burgundy)", fontWeight: 700, fontSize: ".9rem" }}
              >
                ← Edit order
              </Link>
            </p>
          </div>
        )}
      </div>

      <SiteFooter />
    </>
  );
}
