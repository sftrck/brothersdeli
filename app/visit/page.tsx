import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Visit | The Brothers Deli · Downtown Minneapolis Skyway",
  description:
    "Find The Brothers Deli at 50 South Sixth Street, Skyway Level Suite #220, Minneapolis. Hours, map, and directions on the downtown skyway.",
};

export default function VisitPage() {
  return (
    <>
      <SiteHeader />

      <div className="page-intro">
        <div className="wrap">
          <p className="eyebrow">Visit the deli</p>
          <h1>Find Us on the Skyway</h1>
          <p>
            We&apos;re on the climate-controlled skyway level of 50 South Sixth
            Street, Suite #220 — no weather, no traffic, straight from the
            office.
          </p>
        </div>
      </div>

      <div className="visit-page">
        <div className="wrap">
          <div className="visit-cols">
            <div>
              <div className="map-frame">
                <iframe
                  title="Map to The Brothers Deli"
                  src="https://www.google.com/maps?q=50+South+6th+Street+Minneapolis+MN+55402&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                className="btn btn-ghost"
                style={{ marginTop: 16 }}
                href="https://maps.google.com/?q=50+South+6th+Street+Minneapolis+MN+55402"
                target="_blank"
                rel="noopener"
              >
                Get Directions
              </a>
            </div>

            <div>
              <div className="info-card">
                <span className="big">50 South Sixth Street</span>
                <p>
                  Skyway Level, Suite #220
                  <br />
                  Minneapolis, MN 55402
                  <br />
                  <br />
                  <a href="tel:16123418007">(612) 341-8007</a>
                  <br />
                  <a href="mailto:thedeli@thebrothersdeli.com">
                    thedeli@thebrothersdeli.com
                  </a>
                </p>
              </div>

              <div className="info-card">
                <h2>Hours</h2>
                <table className="hours-table">
                  <tbody>
                    <tr>
                      <td>Monday – Thursday</td>
                      <td className="t">7:30 AM – 1:30 PM</td>
                    </tr>
                    <tr>
                      <td>Friday</td>
                      <td className="t">10:30 AM – 1:00 PM</td>
                    </tr>
                    <tr>
                      <td>Saturday</td>
                      <td className="t closed">Closed</td>
                    </tr>
                    <tr>
                      <td>Sunday</td>
                      <td className="t closed">Closed</td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ marginTop: 12, fontSize: ".92rem", color: "var(--ink-soft)" }}>
                  Breakfast from open until 10:30 AM. Lunch until close.
                </p>
              </div>

              <div className="info-card">
                <h2>Finding the Skyway</h2>
                <p>
                  The Brothers Deli sits on the second-floor skyway inside 50
                  South Sixth Street. Take any skyway entrance downtown and
                  follow the signs toward 6th Street — we&apos;re Suite #220,
                  warm and dry no matter the Minnesota weather.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link className="btn btn-primary" href="/order">
                  Order Now
                </Link>
                <Link className="btn btn-ghost" href="/order">
                  See the Menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
