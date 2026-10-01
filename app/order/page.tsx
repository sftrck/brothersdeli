"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import {
  MENU,
  needsCustomizer,
  optionAddOn,
  type MenuItem,
} from "@/lib/menu";

type CartMod = { optionId: string; label: string; price: number };
type CartLine = {
  uid: number;
  id: string;
  name: string;
  variantLabel?: string;
  mods: CartMod[];
  unit: number;
  qty: number;
  forName: string;
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

let LINE_UID = 0;

export default function OrderPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">(
    "pickup"
  );
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pickupTime: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  // Open customizer for an item that has a size and/or options.
  const [customizing, setCustomizing] = useState<null | {
    item: MenuItem;
    variantLabel?: string;
    sel: Record<string, string>; // optionId -> chosen choice label ("" = none)
  }>(null);
  const router = useRouter();

  // Restore a saved cart so items survive leaving the site or changing pages.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bd_cart");
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.cart) && saved.cart.length) {
          // Normalize lines saved by older builds (e.g. before `mods` existed)
          // so render/submit never read fields off an undefined value.
          const restored = (saved.cart as CartLine[]).map((l) => ({
            ...l,
            mods: Array.isArray(l.mods) ? l.mods : [],
          }));
          setCart(restored);
          const maxUid = saved.cart.reduce(
            (m: number, l: CartLine) => Math.max(m, l.uid || 0),
            0
          );
          LINE_UID = Math.max(LINE_UID, maxUid);
        }
        if (saved.fulfillment === "pickup" || saved.fulfillment === "delivery") {
          setFulfillment(saved.fulfillment);
        }
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // Persist the cart on every change (only after the initial restore).
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("bd_cart", JSON.stringify({ cart, fulfillment }));
    } catch {
      /* ignore */
    }
  }, [cart, fulfillment, loaded]);

  const total = useMemo(
    () => cart.reduce((s, l) => s + l.unit * l.qty, 0),
    [cart]
  );

  function pushLine(
    item: MenuItem,
    variantLabel: string | undefined,
    mods: CartMod[]
  ) {
    const base =
      item.variants && variantLabel
        ? item.variants.find((v) => v.label === variantLabel)?.price ??
          item.price ??
          0
        : item.price ?? 0;
    const unit = base + mods.reduce((s, m) => s + m.price, 0);
    setCart((prev) => [
      ...prev,
      {
        uid: ++LINE_UID,
        id: item.id,
        name: item.name,
        variantLabel,
        mods,
        unit,
        qty: 1,
        forName: "",
      },
    ]);
  }

  function addItem(item: MenuItem) {
    if (needsCustomizer(item)) {
      const sel: Record<string, string> = {};
      for (const opt of item.options ?? []) {
        sel[opt.id] = opt.required ? opt.choices[0].label : "";
      }
      setCustomizing({
        item,
        variantLabel: item.variants?.length ? item.variants[0].label : undefined,
        sel,
      });
      return;
    }
    pushLine(item, undefined, []);
  }

  function confirmCustomizer() {
    if (!customizing) return;
    const { item, variantLabel, sel } = customizing;
    const mods: CartMod[] = [];
    for (const opt of item.options ?? []) {
      const choice = sel[opt.id];
      if (choice) {
        mods.push({ optionId: opt.id, label: choice, price: optionAddOn(opt, choice) });
      }
    }
    pushLine(item, variantLabel, mods);
    setCustomizing(null);
  }

  // live price preview inside the customizer
  const customizerUnit = useMemo(() => {
    if (!customizing) return 0;
    const { item, variantLabel, sel } = customizing;
    const base =
      item.variants && variantLabel
        ? item.variants.find((v) => v.label === variantLabel)?.price ??
          item.price ??
          0
        : item.price ?? 0;
    let add = 0;
    for (const opt of item.options ?? []) {
      if (sel[opt.id]) add += optionAddOn(opt, sel[opt.id]);
    }
    return base + add;
  }, [customizing]);

  function changeQty(uid: number, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.uid === uid ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function setForName(uid: number, value: string) {
    setCart((prev) =>
      prev.map((l) => (l.uid === uid ? { ...l, forName: value } : l))
    );
  }

  function removeLine(uid: number) {
    setCart((prev) => prev.filter((l) => l.uid !== uid));
  }

  async function submit() {
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please add your name and a phone number.");
      return;
    }
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setError("Please enter a valid email (or leave it blank).");
      return;
    }
    if (fulfillment === "delivery" && !form.address.trim()) {
      setError("Please add a delivery address.");
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
          fulfillment,
          items: cart.map((l) => ({
            id: l.id,
            variantLabel: l.variantLabel,
            qty: l.qty,
            forName: l.forName,
            mods: (l.mods ?? []).map((m) => ({ optionId: m.optionId, label: m.label })),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please call us to order.");
        return;
      }
      // Hand the order to checkout (Payanywhere).
      const pending = {
        type: fulfillment === "delivery" ? "Delivery" : "Pickup",
        orderId: data.orderId,
        total: data.total,
        lines: cart.map((l) => ({
          name: `${l.name}${l.variantLabel ? ` — ${l.variantLabel}` : ""}`,
          detail: [
            ...(l.mods ?? []).map((m) => m.label),
            l.qty > 1 ? `qty ${l.qty}` : "",
            l.forName ? `for ${l.forName}` : "",
          ]
            .filter(Boolean)
            .join(" · ") || undefined,
          amount: l.unit * l.qty,
        })),
        contact: { name: form.name, email: form.email, phone: form.phone },
      };
      try {
        sessionStorage.setItem("bd_checkout", JSON.stringify(pending));
      } catch {
        /* ignore */
      }
      router.push("/checkout");
    } catch {
      setError("Network error. Please call (612) 341-8007 to order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <div className="page-intro">
        <div className="wrap">
          <p className="eyebrow">Order now · pickup or delivery</p>
          <h1>Build Your Order</h1>
          <p>
            Add what you&apos;d like, then choose pickup at the skyway counter or
            delivery — usually ready in about 15 minutes. Sandwiches come with
            chips and a pickle; soups and salads come with a popover.
          </p>
          <p style={{ marginTop: 12, fontSize: ".92rem" }}>
            Ordering for 8 or more?{" "}
            <Link href="/catering" style={{ color: "var(--burgundy)", fontWeight: 700 }}>
              Go to catering →
            </Link>
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
                    <Fragment key={item.id}>
                      {item.group && (
                        <h3 className="menu-subhead">{item.group}</h3>
                      )}
                    <div className="mrow">
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
                        <button
                          className="add-btn"
                          onClick={() => addItem(item)}
                        >
                          {needsCustomizer(item) ? "Choose" : "Add +"}
                        </button>
                      </div>
                    </div>
                    </Fragment>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className={`cart${cartOpen ? " open" : ""}`}>
            <div className="cart-head">
              <h2>Your Order</h2>
              <button
                type="button"
                className="cart-close"
                aria-label="Close order"
                onClick={() => setCartOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="fulfill" role="group" aria-label="Pickup or delivery">
              <button
                type="button"
                className={fulfillment === "pickup" ? "on" : ""}
                onClick={() => setFulfillment("pickup")}
              >
                Pickup
              </button>
              <button
                type="button"
                className={fulfillment === "delivery" ? "on" : ""}
                onClick={() => setFulfillment("delivery")}
              >
                Delivery
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="empty">Nothing added yet. Pick something tasty.</p>
            ) : (
              <>
                {cart.map((l) => (
                  <div className="cart-line" key={l.uid}>
                    <div style={{ flex: 1 }}>
                      <div className="l-name">
                        {l.name}
                        {l.variantLabel ? ` — ${l.variantLabel}` : ""}
                      </div>
                      {(l.mods?.length ?? 0) > 0 && (
                        <div className="l-mods">
                          {l.mods.map((m) => m.label).join(" · ")}
                        </div>
                      )}
                      <input
                        className="for-name"
                        value={l.forName}
                        onChange={(e) => setForName(l.uid, e.target.value)}
                        placeholder="For (name) — optional"
                      />
                      <div className="qty">
                        <button onClick={() => changeQty(l.uid, -1)}>−</button>
                        <span>{l.qty}</span>
                        <button onClick={() => changeQty(l.uid, 1)}>+</button>
                      </div>
                      <button
                        className="l-remove"
                        onClick={() => removeLine(l.uid)}
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
                <div className="tax-note">
                  {fulfillment === "delivery"
                    ? "Tax and any delivery fee confirmed by the deli."
                    : "Tax added at the register."}
                </div>

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
                    <label>{fulfillment === "delivery" ? "Time" : "Pickup time"}</label>
                    <input
                      value={form.pickupTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, pickupTime: e.target.value }))
                      }
                      placeholder="ASAP / 12:15"
                    />
                  </div>
                </div>
                {fulfillment === "delivery" && (
                  <div className="field">
                    <label>Delivery address *</label>
                    <textarea
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      placeholder="Street address, suite/floor, company…"
                    />
                  </div>
                )}
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
                  {submitting ? "Sending…" : "Continue to Checkout"}
                </button>
              </>
            )}
          </aside>
        </div>
      </div>

      {/* Mobile: always-reachable order bar that opens the cart drawer */}
      {cart.length > 0 && (
        <button
          className="cart-bar"
          onClick={() => setCartOpen(true)}
          aria-label="View your order"
        >
          <span className="cb-info">
            {cart.reduce((s, l) => s + l.qty, 0)}{" "}
            {cart.reduce((s, l) => s + l.qty, 0) === 1 ? "item" : "items"}
            <small>Tap to review &amp; check out</small>
          </span>
          <span className="cb-cta">View order · {money(total)}</span>
        </button>
      )}
      <div
        className={`cart-overlay${cartOpen ? " open" : ""}`}
        onClick={() => setCartOpen(false)}
      />

      {/* Customizer modal — size / bread / cheese / protein / cookie flavor */}
      {customizing && (
        <div className="cz-overlay" onClick={() => setCustomizing(null)}>
          <div className="cz" onClick={(e) => e.stopPropagation()}>
            <div className="cz-head">
              <div>
                <h3>{customizing.item.name}</h3>
                {customizing.item.desc && <p>{customizing.item.desc}</p>}
              </div>
              <button
                className="cart-close"
                aria-label="Close"
                onClick={() => setCustomizing(null)}
              >
                ✕
              </button>
            </div>

            {customizing.item.variants &&
              customizing.item.variants.length > 1 && (
                <div className="cz-opt">
                  <div className="cz-label">Size</div>
                  {customizing.item.variants.map((v) => (
                    <label className="cz-choice" key={v.label}>
                      <input
                        type="radio"
                        name="size"
                        checked={customizing.variantLabel === v.label}
                        onChange={() =>
                          setCustomizing((c) =>
                            c ? { ...c, variantLabel: v.label } : c
                          )
                        }
                      />
                      <span>{v.label}</span>
                      <span className="cz-price">{money(v.price)}</span>
                    </label>
                  ))}
                </div>
              )}

            {(customizing.item.options ?? []).map((opt) => (
              <div className="cz-opt" key={opt.id}>
                <div className="cz-label">
                  {opt.label}
                  {opt.required && <span className="cz-req">required</span>}
                </div>
                {!opt.required && (
                  <label className="cz-choice">
                    <input
                      type="radio"
                      name={opt.id}
                      checked={customizing.sel[opt.id] === ""}
                      onChange={() =>
                        setCustomizing((c) =>
                          c
                            ? { ...c, sel: { ...c.sel, [opt.id]: "" } }
                            : c
                        )
                      }
                    />
                    <span>None</span>
                  </label>
                )}
                {opt.choices.map((ch) => (
                  <label className="cz-choice" key={ch.label}>
                    <input
                      type="radio"
                      name={opt.id}
                      checked={customizing.sel[opt.id] === ch.label}
                      onChange={() =>
                        setCustomizing((c) =>
                          c
                            ? { ...c, sel: { ...c.sel, [opt.id]: ch.label } }
                            : c
                        )
                      }
                    />
                    <span>{ch.label}</span>
                    {ch.price ? (
                      <span className="cz-price">+{money(ch.price)}</span>
                    ) : null}
                  </label>
                ))}
              </div>
            ))}

            <button className="submit-btn" onClick={confirmCustomizer}>
              Add to order · {money(customizerUnit)}
            </button>
          </div>
        </div>
      )}

      <SiteFooter />
    </>
  );
}
