"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { CATERING, CATERING_MIN_HEADCOUNT, findCateringItem } from "@/lib/catering";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function CateringPage() {
  const [headcount, setHeadcount] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
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
        const saved = JSON.parse(raw);
        if (typeof saved.headcount === "string") setHeadcount(saved.headcount);
        if (Array.isArray(saved.selected)) setSelected(new Set(saved.selected));
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
        JSON.stringify({ headcount, selected: Array.from(selected) })
      );
    } catch {
      /* ignore */
    }
  }, [headcount, selected, loaded]);

  const heads = Math.max(0, Math.floor(Number(headcount) || 0));

  const selectedItems = useMemo(
    () =>
      Array.from(selected)
        .map((id) => findCateringItem(id))
        .filter((x): x is NonNullable<typeof x> => Boolean(x)),
    [selected]
  );

  const perPersonSum = selectedItems.reduce((s, it) => s + it.perPerson, 0);
  const total = heads * perPersonSum;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    setError("");
    if (heads < CATERING_MIN_HEADCOUNT) {
      setError(`Catering has an ${CATERING_MIN_HEADCOUNT}-person minimum — enter your headcount.`);
      return;
    }
    if (selectedItems.length === 0) {
      setError("Pick at least one item for your estimate.");
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
          items: selectedItems.map((it) => it.id),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please email us directly.");
        return;
      }
      // Hand the order to checkout (Payanywhere).
      const pending = {
        type: "Catering",
        orderId: data.inquiryId,
        headcount: heads,
        total: data.total,
        lines: selectedItems.map((it) => ({
          name: it.name,
          detail: `${money(it.perPerson)}/pp × ${heads}`,
          amount: it.perPerson * heads,
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
                      <label
                        className={`crow${sel ? " sel" : ""}`}
                        key={it.id}
                      >
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
              <>
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
                            <span className="pp">
                              {" "}
                              · {money(it.perPerson)}/pp
                            </span>
                          </span>
                          <span>
                            {heads > 0 ? money(it.perPerson * heads) : "—"}
                          </span>
                        </div>
                      ))}
                      <div className="est-total">
                        <span>{heads > 0 ? `${heads} people` : "Total"}</span>
                        <span>{money(total)}</span>
                      </div>
                      <div className="est-note">
                        {money(perPersonSum)} per person × {heads || 0}. Tax and
                        any delivery confirmed by the deli at checkout.
                      </div>
                    </>
                  )}

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
                      placeholder="Delivery or pickup, dietary needs, timing…"
                    />
                  </div>

                  {error && <div className="form-err">{error}</div>}

                  <button className="submit-btn" onClick={submit} disabled={submitting}>
                    {submitting
                      ? "Starting checkout…"
                      : "Complete Catering Purchase"}
                  </button>
              </>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
