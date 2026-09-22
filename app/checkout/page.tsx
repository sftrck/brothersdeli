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
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

// Interim: Payanywhere "Website Payment Link" (open-amount hosted page).
// Override in Vercel with NEXT_PUBLIC_PAYANYWHERE_PAYMENT_LINK if it's rotated.
const PAYMENT_LINK =
  process.env.NEXT_PUBLIC_PAYANYWHERE_PAYMENT_LINK ||
  "https://pymntlink.com/payment-link?token=MGUxNDM0YjE5MmM4ZmE3NjljZGE1MDA1Y2MxMTI0Zjg6NzM2YzQwZjRjMzJlMWNlZGM5MjBhYjE2Zjg5ZGMyOTcwYjViZThhZGI2NGQ3ZTkyZDdmMjgwZGVkNDU5ZTJmOGJkZGM1NTM5Nzg4OGM3NGJmYmZkOGRmZTVmMDQzYjU5YjU4MTE4YWIzOGFhOWZmZjBiNjEwYzNmY2U1MTc3Zjg0NmI0NTZmZWQwMmQ1ZDEwZmRmMDUxZThlOGExNmNjZDRkZDA3MDUyYzVjZWNjNTk0NjEzNmFjNGJkNzIyNTY1M2U1NTk1MjQ4ZmIwMzg1YzE1MmMzMDA4YTVmMTQyYTExNjcxYmNkZTk1NmZhNTFkYzU4NDA4NWZkZjVlZDY1ZThlYjUzYTVkMDAyZjM3NTY2ZDkwZmQ3MzMxODlkYzRlNzllMzNjYmU1YmEyMmVlYmZhYTU1M2Q2MDUyODk4YWQ3NDdkZjg4YjcxYzcwNTIzM2Q5ZmVmYTBhNjE5MDgzMmFlMGEwNzg1ZjEyYTBhYWFkNzI1NDAzOGUzOWEyODli";

export default function CheckoutPage() {
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [pending, setPending] = useState(false);
  const [linkPay, setLinkPay] = useState(false);
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

  async function pay() {
    if (!order) return;
    setError("");
    setPaying(true);
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
      if (!res.ok || !data.ok) {
        setError(data.error || "Couldn't start checkout. Please call the deli.");
        return;
      }
      if (data.configured && data.session) {
        // TODO(embedded): North Embedded Checkout is configured — mount the
        // Fields with data.session and confirm on approval. Until that's wired,
        // fall through to the interim payment link below.
      }
      if (PAYMENT_LINK) {
        // Interim: open the Payanywhere payment link; customer enters the total.
        window.open(PAYMENT_LINK, "_blank", "noopener,noreferrer");
        setLinkPay(true);
        return;
      }
      // No payment configured — order is recorded, deli confirms payment.
      setPending(true);
      try {
        sessionStorage.removeItem("bd_checkout");
      } catch {
        /* ignore */
      }
    } catch {
      setError("Network error. Please call (612) 341-8007 to finish your order.");
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
        {!loaded ? null : linkPay ? (
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
              Trouble paying? Call <a href="tel:16123418007">(612) 341-8007</a>.
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
              <a href="tel:16123418007">(612) 341-8007</a>.
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
              Tax and any delivery not included — confirmed by the deli.
            </p>

            {error && <div className="form-err">{error}</div>}

            <button className="submit-btn" onClick={pay} disabled={paying}>
              {paying ? "Starting checkout…" : `Pay with Payanywhere · ${money(order.total)}`}
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
