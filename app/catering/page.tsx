"use client";

import { useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

const OFFERINGS: { group: string; items: { name: string; desc?: string; price: string }[] }[] = [
  {
    group: "Breakfast Trays",
    items: [
      { name: "Bagel Tray", desc: "Fresh bagels, cream cheese, strawberry jam, sweet butter", price: "$5.95/person" },
      { name: "Muffins & Bagels Tray", desc: "Baked muffins and bagels, butter and cream cheese", price: "$5.95/person" },
      { name: "Breakfast Tray", desc: "Cinnamon & caramel rolls, muffins, coffee cake, bagels", price: "$5.95/person" },
      { name: "Bagel & Egg Sandwich Tray", desc: "Egg, cheese, ham, sausage, bacon", price: "$9.45/person" },
    ],
  },
  {
    group: "Hot Lunches",
    items: [
      { name: "Homemade Sloppy Joe", desc: "Coleslaw, chips and pickles", price: "$15.99/person" },
      { name: "Rosemary Chicken", desc: "Red potatoes, green beans, rolls and butter", price: "$15.99/person" },
      { name: "Hot Turkey Meal", desc: "Garlic mashed potatoes, gravy, rolls, salad", price: "$15.99/person" },
      { name: "BBQ Beef or Pork", desc: "Coleslaw, chips, pickles", price: "$15.99/person" },
      { name: "Taco Bar", desc: "Chicken, ground beef, all the fixings, buffet style", price: "$15.99/person" },
    ],
  },
  {
    group: "Box Lunches",
    items: [
      { name: "Budget Box Lunch", desc: "Deli sandwich, chips and a sweet", price: "$15.99" },
      { name: "Deluxe Box Lunch", desc: "Any sandwich, apple, potato salad or chips, and a sweet", price: "$17.99" },
      { name: "Salad Box Lunch", desc: "Any salad with a popover, apple and a sweet", price: "$17.99" },
    ],
  },
  {
    group: "Deli & Bakery Trays",
    items: [
      { name: "Sandwich Tray", desc: "Variety of sandwiches, cheese, dills, potato salad or slaw", price: "$13.99/person" },
      { name: "Meat & Cheese Tray", desc: "Corned beef, roast beef, ham, turkey, cheeses, dills, bread", price: "$12.99/person" },
      { name: "Salad Tray", desc: "Any of our salads with popovers", price: "$12.99/person" },
      { name: "Fresh Fruit / Vegetable Tray", price: "$5.95/person" },
      { name: "Cookies / Brownies & Bars", price: "$4.45–$6.95" },
    ],
  },
];

export default function CateringPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    eventDate: "",
    headcount: "",
    service: "Box lunches",
    details: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { inquiryId: string }>(null);

  async function submit() {
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please add your name, email, and phone.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/catering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please email us directly.");
        return;
      }
      setDone({ inquiryId: data.inquiryId });
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
            The same corned beef, pastrami, and popovers — set up for the whole
            room. Tell us about your event and we&apos;ll put together a quote.
            Catering needs 24 hours&apos; notice and an 8-person minimum.
          </p>
        </div>
      </div>

      <div className="cater-page">
        <div className="wrap">
          <div className="cater-cols">
            <div>
              {OFFERINGS.map((g) => (
                <div key={g.group}>
                  <h2>{g.group}</h2>
                  {g.items.map((it) => (
                    <div className="offer" key={it.name}>
                      <div>
                        <div className="oname">{it.name}</div>
                        {it.desc && <div className="odesc">{it.desc}</div>}
                      </div>
                      <div className="oprice">{it.price}</div>
                    </div>
                  ))}
                </div>
              ))}
              <a className="pdf-link" href="/catering-menu.pdf" target="_blank" rel="noopener">
                Download the full catering menu (PDF) →
              </a>
            </div>

            <div className="cater-form">
              {done ? (
                <>
                  <h3>Request Sent</h3>
                  <p className="mini">
                    Thanks! Your inquiry{" "}
                    <b>{done.inquiryId}</b> is in — we&apos;ll get back to you
                    shortly to finalize the details. For anything urgent, call{" "}
                    <a href="tel:16123418007">(612) 341-8007</a>.
                  </p>
                </>
              ) : (
                <>
                  <h3>Request a Quote</h3>
                  <p className="mini">We&apos;ll reply by email or phone.</p>

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
                  <div className="field">
                    <label>Company / group</label>
                    <input
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    />
                  </div>
                  <div className="field row">
                    <div>
                      <label>Event date</label>
                      <input
                        type="date"
                        value={form.eventDate}
                        onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label>Headcount</label>
                      <input
                        value={form.headcount}
                        onChange={(e) => setForm((f) => ({ ...f, headcount: e.target.value }))}
                        placeholder="e.g. 20"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Type of service</label>
                    <select
                      value={form.service}
                      onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                    >
                      <option>Breakfast trays</option>
                      <option>Hot lunch</option>
                      <option>Box lunches</option>
                      <option>Deli &amp; bakery trays</option>
                      <option>Not sure yet</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Details</label>
                    <textarea
                      value={form.details}
                      onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                      placeholder="Delivery or pickup, dietary needs, budget, timing…"
                    />
                  </div>

                  {error && <div className="form-err">{error}</div>}

                  <button className="submit-btn" onClick={submit} disabled={submitting}>
                    {submitting ? "Sending…" : "Send Catering Request"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
