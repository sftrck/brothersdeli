"use client";

import { useMemo, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { MENU, type MenuItem } from "@/lib/menu";

type CartLine = {
  key: string;
  id: string;
  name: string;
  variantLabel?: string;
  unit: number;
  qty: number;
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function OrderPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [variantSel, setVariantSel] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pickupTime: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { orderId: string; mode: string }>(
    null
  );

  const total = useMemo(
    () => cart.reduce((s, l) => s + l.unit * l.qty, 0),
    [cart]
  );

  function addItem(item: MenuItem) {
    let variantLabel: string | undefined;
    let unit = item.price ?? 0;
    if (item.variants && item.variants.length) {
      const chosen = variantSel[item.id] || item.variants[0].label;
      const v =
        item.variants.find((x) => x.label === chosen) || item.variants[0];
      variantLabel = v.label;
      unit = v.price;
    }
    const key = `${item.id}::${variantLabel ?? ""}`;
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [
        ...prev,
        { key, id: item.id, name: item.name, variantLabel, unit, qty: 1 },
      ];
    });
  }

  function changeQty(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  async function submit() {
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please add your name and a phone number for pickup.");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: cart.map((l) => ({
            id: l.id,
            variantLabel: l.variantLabel,
            qty: l.qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please call us to order.");
        return;
      }
      setDone({ orderId: data.orderId, mode: data.mode });
      setCart([]);
    } catch {
      setError("Network error. Please call (612) 341-8007 to order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <>
        <SiteHeader />
        <div className="confirm">
          <div className="tick">✓</div>
          <h2>Order Received</h2>
          <p>
            Thanks! Your order <span className="oid">{done.orderId}</span> is in.
            We&apos;ll have it ready at the skyway counter, Suite #220.
          </p>
          <p>
            {done.mode === "pay_at_pickup"
              ? "Pay at the counter when you pick up. Usually ready in about 15 minutes."
              : "Payment confirmed. Usually ready in about 15 minutes."}
          </p>
          <p>
            Questions? Call <a href="tel:16123418007">(612) 341-8007</a>.
          </p>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />

      <div className="page-intro">
        <div className="wrap">
          <p className="eyebrow">Order for pickup</p>
          <h1>Build Your Order</h1>
          <p>
            Add what you&apos;d like and pick it up at the skyway counter, Suite
            #220 — usually ready in about 15 minutes. Sandwiches come with chips
            and a pickle; soups and salads come with a popover.
          </p>
        </div>
      </div>

      <nav className="catnav">
        <div className="wrap">
          {MENU.map((c) => (
            <a key={c.id} href={`#${c.id}`}>
              {c.name}
            </a>
          ))}
        </div>
      </nav>

      <div className="wrap" style={{ paddingBlock: 32 }}>
        <div className="order-layout">
          <div>
            {MENU.map((cat) => (
              <section className="menu-cat" id={cat.id} key={cat.id}>
                <h2>{cat.name}</h2>
                {cat.note && <p className="note">{cat.note}</p>}
                <div className="menu-list">
                  {cat.items.map((item) => (
                    <div className="mrow" key={item.id}>
                      <div className="info">
                        <h3>{item.name}</h3>
                        {item.desc && <p>{item.desc}</p>}
                      </div>
                      <div className="right">
                        <span className="price">
                          {item.variants
                            ? `${money(item.variants[0].price)}+`
                            : money(item.price ?? 0)}
                        </span>
                        {item.variants && (
                          <select
                            value={
                              variantSel[item.id] || item.variants[0].label
                            }
                            onChange={(e) =>
                              setVariantSel((s) => ({
                                ...s,
                                [item.id]: e.target.value,
                              }))
                            }
                          >
                            {item.variants.map((v) => (
                              <option key={v.label} value={v.label}>
                                {v.label} — {money(v.price)}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          className="add-btn"
                          onClick={() => addItem(item)}
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="cart">
            <h2>Your Order</h2>
            {cart.length === 0 ? (
              <p className="empty">Nothing added yet. Pick something tasty.</p>
            ) : (
              <>
                {cart.map((l) => (
                  <div className="cart-line" key={l.key}>
                    <div>
                      <div className="l-name">
                        {l.name}
                        {l.variantLabel ? ` — ${l.variantLabel}` : ""}
                      </div>
                      <div className="qty">
                        <button onClick={() => changeQty(l.key, -1)}>−</button>
                        <span>{l.qty}</span>
                        <button onClick={() => changeQty(l.key, 1)}>+</button>
                      </div>
                      <button
                        className="l-remove"
                        onClick={() => removeLine(l.key)}
                      >
                        remove
                      </button>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {money(l.unit * l.qty)}
                    </div>
                  </div>
                ))}
                <div className="cart-total">
                  <span>Subtotal</span>
                  <span>{money(total)}</span>
                </div>
                <div className="tax-note">Tax added at the register.</div>

                <div className="field">
                  <label>Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Your name"
                  />
                </div>
                <div className="field row">
                  <div>
                    <label>Phone *</label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="(612) …"
                      inputMode="tel"
                    />
                  </div>
                  <div>
                    <label>Pickup time</label>
                    <input
                      value={form.pickupTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, pickupTime: e.target.value }))
                      }
                      placeholder="ASAP / 12:15"
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Email (for a receipt)</label>
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="you@email.com"
                    inputMode="email"
                  />
                </div>
                <div className="field">
                  <label>Notes (bread, no pickle, etc.)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    placeholder="Rye bread, extra mustard…"
                  />
                </div>

                {error && <div className="form-err">{error}</div>}

                <button
                  className="submit-btn"
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Place Pickup Order"}
                </button>
              </>
            )}
          </aside>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
