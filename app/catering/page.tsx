"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import {
  CATERING,
  CATERING_MIN_HEADCOUNT,
  findCateringItem,
  type CateringChoice,
} from "@/lib/catering";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function CateringPage() {
  const [headcount, setHeadcount] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [veg, setVeg] = useState(false);
  const [vegCount, setVegCount] = useState("");
  const [gf, setGf] = useState(false);
  const [gfCount, setGfCount] = useState("");
  const [utensils, setUtensils] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    eventDate: "",
    details: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  // Restore a saved catering order so selections survive leaving the page.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bd_catering");
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.headcount === "string") setHeadcount(s.headcount);
        if (Array.isArray(s.selected)) setSelected(new Set(s.selected));
        if (s.choices && typeof s.choices === "object") setChoices(s.choices);
        if (s.fulfillment === "delivery") setFulfillment("delivery");
        if (typeof s.address === "string") setAddress(s.address);
        if (s.veg) setVeg(true);
        if (typeof s.vegCount === "string") setVegCount(s.vegCount);
        if (s.gf) setGf(true);
        if (typeof s.gfCount === "string") setGfCount(s.gfCount);
        if (s.utensils) setUtensils(true);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        "bd_catering",
        JSON.stringify({
          headcount,
          selected: Array.from(selected),
          choices,
          fulfillment,
          address,
          veg,
          vegCount,
          gf,
          gfCount,
          utensils,
        })
      );
    } catch {
      /* ignore */
    }
  }, [headcount, selected, choices, fulfillment, address, veg, vegCount, gf, gfCount, utensils, loaded]);

  const heads = Math.max(0, Math.floor(Number(headcount) || 0));
  const gfNum = gf ? Math.max(0, Math.floor(Number(gfCount) || 0)) : 0;

  const selectedItems = useMemo(
    () =>
      Array.from(selected)
        .map((id) => findCateringItem(id))
        .filter((x): x is NonNullable<typeof x> => Boolean(x)),
    [selected]
  );

  const perPersonSum = selectedItems.reduce((s, it) => s + it.perPerson, 0);
  const foodTotal = heads * perPersonSum;
  const gfUpcharge = gfNum * 2;
  const estimateTotal = foodTotal + gfUpcharge;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function choiceVal(itemId: string, c: CateringChoice) {
    return choices[`${itemId}:${c.id}`] || c.options[0];
  }
  function choiceSummary(
    it: NonNullable<ReturnType<typeof findCateringItem>>
  ): string {
    if (!it.chooses) return "";
    return it.chooses.map((c) => choiceVal(it.id, c)).join(", ");
  }

  async function submit() {
    setError("");
    if (heads < CATERING_MIN_HEADCOUNT) {
      setError(`Catering has an ${CATERING_MIN_HEADCOUNT}-person minimum — enter your headcount.`);
      return;
    }
    if (selectedItems.length === 0) {
      setError("Pick at least one item.");
      return;
    }
    if (fulfillment === "delivery" && !address.trim()) {
      setError("Please add a delivery address.");
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please add your name, email, and phone.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/catering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          headcount: heads,
          items: selectedItems.map((it) => ({
            id: it.id,
            choices: it.chooses
              ? Object.fromEntries(
                  it.chooses.map((c) => [c.id, choiceVal(it.id, c)])
                )
              : undefined,
          })),
          fulfillment,
          address,
          vegCount: veg ? Math.max(0, Math.floor(Number(vegCount) || 0)) : 0,
          gfCount: gfNum,
          utensils,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please email us directly.");
        return;
      }
      // Server returns authoritative lines + total (incl. delivery + GF).
      const pending = {
        type: "Catering",
        orderId: data.inquiryId,
        headcount: heads,
        total: data.total,
        lines: data.lines,
        contact: { name: form.name, email: form.email, phone: form.phone },
      };
      try {
        sessionStorage.setItem("bd_checkout", JSON.stringify(pending));
      } catch {
        /* ignore */
      }
      router.push("/checkout");
    } catch {
      setError("Network error. Please email thedeli@thebrothersdeli.com.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />

      <div className="page-intro">
        <div className="wrap">
          <p className="eyebrow">Catering for 8 or more</p>
          <h1>Cater Your Office</h1>
          <p>
            Tell us how many people, pick what you&apos;d like, and check out
            online. Catering needs 24 hours&apos; notice and an{" "}
            {CATERING_MIN_HEADCOUNT}-person minimum.
          </p>
          <p style={{ marginTop: 12, fontSize: ".92rem" }}>
            Ordering for yourself or a small group?{" "}
            <a href="/order" style={{ color: "var(--burgundy)", fontWeight: 700 }}>
              Order now →
            </a>
          </p>
        </div>
      </div>

      <div className="cater-page">
        <div className="wrap">
          <div className="cater-cols">
            <div className="cater-select">
              <div className="headcount-bar">
                <label htmlFor="headcount">How many people?</label>
                <input
                  id="headcount"
                  value={headcount}
                  onChange={(e) =>
                    setHeadcount(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="e.g. 20"
                  inputMode="numeric"
                />
                <span className="hint">
                  {CATERING_MIN_HEADCOUNT}-person minimum. Prices below update
                  for your headcount.
                </span>
              </div>

              {CATERING.map((g) => (
                <div className="grp" key={g.id}>
                  <h2>{g.name}</h2>
                  {g.items.map((it) => {
                    const sel = selected.has(it.id);
                    return (
                      <div key={it.id}>
                        <label className={`crow${sel ? " sel" : ""}`}>
                          <input
                            type="checkbox"
                            checked={sel}
                            onChange={() => toggle(it.id)}
                          />
                          <div className="ci">
                            <div className="cn">{it.name}</div>
                            {it.desc && <div className="cd">{it.desc}</div>}
                          </div>
                          <div className="cp">
                            {heads > 0 ? (
                              <>
                                {money(it.perPerson * heads)}
                                <small>
                                  {money(it.perPerson)}/pp × {heads}
                                </small>
                              </>
                            ) : (
                              <>
                                {money(it.perPerson)}
                                <small>per person</small>
                              </>
                            )}
                          </div>
                        </label>
                        {sel &&
                          it.chooses?.map((c) => (
                            <div className="crow-choice" key={c.id}>
                              <label>{c.label}</label>
                              <select
                                value={choices[`${it.id}:${c.id}`] || c.options[0]}
                                onChange={(e) =>
                                  setChoices((prev) => ({
                                    ...prev,
                                    [`${it.id}:${c.id}`]: e.target.value,
                                  }))
                                }
                              >
                                {c.options.map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              ))}

              <a
                className="pdf-link"
                href="/catering-menu.pdf"
                target="_blank"
                rel="noopener"
              >
                Download the full catering menu (PDF) →
              </a>
            </div>

            <div className="est-summary">
              <h3>Your Order</h3>

              {selectedItems.length === 0 ? (
                <p className="est-empty">
                  Select items and enter a headcount to see your estimate.
                </p>
              ) : (
                <>
                  {selectedItems.map((it) => (
                    <div className="est-line" key={it.id}>
                      <span>
                        {it.name}
                        {choiceSummary(it) ? ` — ${choiceSummary(it)}` : ""}
                        <span className="pp"> · {money(it.perPerson)}/pp</span>
                      </span>
                      <span>{heads > 0 ? money(it.perPerson * heads) : "—"}</span>
                    </div>
                  ))}
                  {gfUpcharge > 0 && (
                    <div className="est-line">
                      <span>
                        Gluten-free upcharge
                        <span className="pp"> · $2 × {gfNum}</span>
                      </span>
                      <span>{money(gfUpcharge)}</span>
                    </div>
                  )}
                  <div className="est-total">
                    <span>{heads > 0 ? `${heads} people` : "Total"}</span>
                    <span>{money(estimateTotal)}</span>
                  </div>
                  <div className="est-note">
                    {fulfillment === "delivery"
                      ? "Delivery fee is calculated by distance at checkout. "
                      : ""}
                    Tax not included.
                  </div>
                </>
              )}

              {/* Pickup / Delivery */}
              <div className="fulfill" style={{ marginTop: 18 }} role="group" aria-label="Pickup or delivery">
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
              {fulfillment === "delivery" && (
                <div className="field">
                  <label>Delivery address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, suite/floor, company, city…"
                  />
                </div>
              )}

              {/* Dietary + extras */}
              <div className="diet">
                <label className="diet-row">
                  <input type="checkbox" checked={veg} onChange={(e) => setVeg(e.target.checked)} />
                  <span>Need vegetarian options?</span>
                </label>
                {veg && (
                  <input
                    className="diet-count"
                    value={vegCount}
                    onChange={(e) => setVegCount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="How many people?"
                    inputMode="numeric"
                  />
                )}
                <label className="diet-row">
                  <input type="checkbox" checked={gf} onChange={(e) => setGf(e.target.checked)} />
                  <span>Need gluten-free options? (+$2/person)</span>
                </label>
                {gf && (
                  <input
                    className="diet-count"
                    value={gfCount}
                    onChange={(e) => setGfCount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="How many people?"
                    inputMode="numeric"
                  />
                )}
                <label className="diet-row">
                  <input type="checkbox" checked={utensils} onChange={(e) => setUtensils(e.target.checked)} />
                  <span>Need serving utensils, plates, etc.?</span>
                </label>
              </div>

              {/* Contact */}
              <div className="field">
                <label>Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="field row">
                <div>
                  <label>Email *</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    inputMode="email"
                  />
                </div>
                <div>
                  <label>Phone *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    inputMode="tel"
                  />
                </div>
              </div>
              <div className="field row">
                <div>
                  <label>Company / group</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  />
                </div>
                <div>
                  <label>Event date</label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="field">
                <label>Details</label>
                <textarea
                  value={form.details}
                  onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                  placeholder="Timing, allergies, special requests…"
                />
              </div>

              {error && <div className="form-err">{error}</div>}

              <button className="submit-btn" onClick={submit} disabled={submitting}>
                {submitting ? "Starting checkout…" : "Complete Catering Purchase"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
