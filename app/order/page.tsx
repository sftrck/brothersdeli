"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import AddressAutocomplete, {
  type PickedAddress,
} from "../components/AddressAutocomplete";
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

// Pickup times, in the deli's local (Chicago) hours. Minutes since midnight.
const DELI_HOURS: Record<number, [number, number] | null> = {
  0: null, // Sun — closed
  1: [7 * 60 + 30, 13 * 60 + 30], // Mon 7:30–1:30
  2: [7 * 60 + 30, 13 * 60 + 30],
  3: [7 * 60 + 30, 13 * 60 + 30],
  4: [7 * 60 + 30, 13 * 60 + 30],
  5: [10 * 60 + 30, 13 * 60], // Fri 10:30–1:00
  6: null, // Sat — closed
};
const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function chicagoNow(now: Date): { wd: number; min: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  let hour = parseInt(get("hour"), 10);
  if (hour === 24) hour = 0; // midnight can report as 24 with hour12:false
  return {
    wd: WEEKDAY.indexOf(get("weekday")),
    min: hour * 60 + parseInt(get("minute"), 10),
  };
}

function fmtTime(min: number): string {
  let h = Math.floor(min / 60);
  const m = min % 60;
  const ap = h < 12 ? "AM" : "PM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
}

// 15-minute pickup slots, earliest = now + 15 min, within open hours. Falls to
// the next open day when today's slots are gone; labels future days (e.g. "Mon").
function buildPickupSlots(now: Date): string[] {
  const { wd, min } = chicagoNow(now);
  const earliest = Math.ceil((min + 15) / 15) * 15;
  for (let off = 0; off < 7; off++) {
    const day = (wd + off) % 7;
    const hrs = DELI_HOURS[day];
    if (!hrs) continue;
    const [open, close] = hrs;
    let start = off === 0 ? Math.max(open, earliest) : open;
    start = Math.ceil(start / 15) * 15;
    if (start > close) continue;
    const slots: string[] = [];
    if (off === 0 && min >= open && min < close) {
      slots.push("As soon as possible (~15 min)");
    }
    for (let t = start; t <= close; t += 15) {
      slots.push(off === 0 ? fmtTime(t) : `${WEEKDAY[day]} ${fmtTime(t)}`);
    }
    return slots;
  }
  return [];
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
  const [addrCoords, setAddrCoords] = useState<{ lat: number; lng: number } | null>(null);
  // Pickup-time slots are computed after mount (client clock) to avoid an SSR
  // hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pickupSlots = useMemo(
    () => (mounted ? buildPickupSlots(new Date()) : []),
    [mounted]
  );
  // Default the pickup time to the earliest slot once slots are known.
  useEffect(() => {
    if (mounted && pickupSlots.length) {
      setForm((f) => (f.pickupTime ? f : { ...f, pickupTime: pickupSlots[0] }));
    }
  }, [mounted, pickupSlots]);
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
    if (fulfillment === "delivery" && (!form.address.trim() || !addrCoords)) {
      setError("Please choose your delivery address from the suggestions.");
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
          addressLat: addrCoords?.lat,
          addressLng: addrCoords?.lng,
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
      const lines: { name: string; detail?: string; amount: number }[] =
        cart.map((l) => ({
          name: `${l.name}${l.variantLabel ? ` — ${l.variantLabel}` : ""}`,
          detail:
            [
              ...(l.mods ?? []).map((m) => m.label),
              l.qty > 1 ? `qty ${l.qty}` : "",
              l.forName ? `for ${l.forName}` : "",
            ]
              .filter(Boolean)
              .join(" · ") || undefined,
          amount: l.unit * l.qty,
        }));
      if (
        fulfillment === "delivery" &&
        typeof data.deliveryFee === "number" &&
        data.deliveryFee > 0
      ) {
        lines.push({
          name:
            "Delivery" +
            (data.deliveryMiles != null ? ` (${data.deliveryMiles} mi)` : ""),
          detail: data.deliveryEta ? `est. ${data.deliveryEta}` : undefined,
          amount: data.deliveryFee,
        });
      }
      const pending = {
        type: fulfillment === "delivery" ? "Delivery" : "Pickup",
        orderId: data.orderId,
        total: data.total,
        lines,
        contact: { name: form.name, email: form.email, phone: form.phone },
      };
      try {
        sessionStorage.setItem("bd_checkout", JSON.stringify(pending));
      } catch {
        /* ignore */
      }
      router.push("/checkout");
    } catch {
      setError("Network error. Please call (612) 314-8007 to order.");
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
            <div className="cart-top">
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
            </div>
            {cart.length === 0 ? (
              <p className="empty">Nothing added yet. Pick something tasty.</p>
            ) : (
              <>
                <div className="cart-scroll">
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
                <div className={`field${fulfillment === "delivery" ? "" : " row"}`}>
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
                  {fulfillment !== "delivery" && (
                    <div>
                      <label>Pickup time</label>
                      <select
                        value={form.pickupTime}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, pickupTime: e.target.value }))
                        }
                      >
                        {!mounted && <option value="">Loading times…</option>}
                        {mounted && pickupSlots.length === 0 && (
                          <option value="">We&apos;ll call to confirm a time</option>
                        )}
                        {pickupSlots.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {fulfillment === "delivery" && (
                  <div className="field">
                    <label>Delivery address *</label>
                    <AddressAutocomplete
                      value={form.address}
                      onType={(text) => {
                        setForm((f) => ({ ...f, address: text }));
                        setAddrCoords(null);
                      }}
                      onPick={(a: PickedAddress) => {
                        setForm((f) => ({ ...f, address: a.label }));
                        setAddrCoords({ lat: a.lat, lng: a.lng });
                      }}
                      placeholder="Start typing your street address…"
                    />
                    <p className="eta-note">
                      {addrCoords
                        ? "Address confirmed — we'll quote your delivery fee and time at checkout (about 25 min of prep plus drive time)."
                        : "Pick your address from the list so we can quote delivery."}
                    </p>
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
                </div>

                <div className="cart-foot">
                  {error && <div className="form-err">{error}</div>}
                  <div className="cart-total">
                    <span>Subtotal</span>
                    <span>{money(total)}</span>
                  </div>
                  <div className="tax-note">
                    {fulfillment === "delivery"
                      ? "Tax and any delivery fee confirmed by the deli."
                      : "Tax added at the register."}
                  </div>
                  <button
                    className="submit-btn"
                    onClick={submit}
                    disabled={submitting}
                  >
                    {submitting ? "Sending…" : "Continue to Checkout"}
                  </button>
                </div>
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
