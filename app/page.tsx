import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import OpenStatus from "./components/OpenStatus";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <section className="hero" id="top">
        <div className="wrap">
          <div>
            <p className="eyebrow">Downtown Minneapolis Skyway · Since 1935</p>
            <h1>
              Seventy Years of the <em>Perfect</em> Sandwich.
            </h1>
            <p className="lead">
              Corned beef and pastrami piled high, soups with a warm popover,
              and the same family recipes since Mike&apos;s Cafe opened its
              doors. Order ahead — it&apos;s ready when you are.
            </p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/order">
                Order Now
              </Link>
              <Link className="btn btn-ghost" href="/order">
                View Full Menu
              </Link>
            </div>
            <OpenStatus />
          </div>
          <div className="hero-art">
            <div className="photo">
              <img
                src="/images/hero-pastrami.jpg"
                alt="Pastrami sandwich piled high on rye"
              />
            </div>
            <div className="badge">
              <b>70</b>
              <span>YEARS</span>
            </div>
            <div className="tag-script">Piled high</div>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="wrap">
          <span>Corned Beef</span>
          <span className="dot">·</span>
          <span>Pastrami</span>
          <span className="dot">·</span>
          <span>Matzo Ball Soup</span>
          <span className="dot">·</span>
          <span>Popovers</span>
          <span className="dot">·</span>
          <span>Catering</span>
        </div>
      </div>

      <section className="block story" id="story">
        <div className="wrap">
          <div>
            <p className="eyebrow">Our Story</p>
            <h2>Three Generations, One Counter.</h2>
            <p>
              It started in 1935 when Mike &amp; Dora Burstein opened a small
              cafe near the Minneapolis Farmers&apos; Market — honest food, made
              by hand, for working people. Their sons grew it into The Brothers
              Deli, and today the family still cures the corned beef, simmers the
              soup, and pulls popovers hot from the oven.
            </p>
            <p className="pull">&quot;You really can taste the years in it.&quot;</p>
          </div>
          <div className="stats">
            <div className="stat">
              <b>1935</b>
              <span>Est. in Minneapolis</span>
            </div>
            <div className="stat">
              <b>3</b>
              <span>Generations family-run</span>
            </div>
            <div className="stat">
              <b>#220</b>
              <span>On the downtown skyway</span>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="menu">
        <div className="wrap">
          <div className="head">
            <div>
              <p className="eyebrow">From the counter</p>
              <h2>Deli Classics, Done Right</h2>
            </div>
            <p>
              Nine kinds of sandwich, big salads, soups by the bowl, and the
              healthy Fit&nbsp;500 line — all made to order.
            </p>
          </div>
          <div className="menu-grid">
            <div className="card">
              <div className="ph">
                <img src="/images/corned-beef.jpg" alt="Corned beef sandwich on rye" />
              </div>
              <div className="body">
                <span className="kicker">The Original</span>
                <h3>Corned Beef on Rye</h3>
                <p>
                  Slow-cured Black Angus corned beef, piled high with a pickle on
                  the side.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="ph">
                <img src="/images/turkey-avocado.jpg" alt="Turkey and avocado sandwich" />
              </div>
              <div className="body">
                <span className="kicker">Fresh Roasted</span>
                <h3>Turkey &amp; Avocado</h3>
                <p>
                  House-roasted turkey, avocado, and greens on your choice of
                  bread.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="ph">
                <img src="/images/matzo-ball-soup.jpg" alt="Matzo ball soup" />
              </div>
              <div className="body">
                <span className="kicker">Simmered Slow</span>
                <h3>Matzo Ball Soup</h3>
                <p>
                  Golden chicken broth and a tender matzo ball — comes with a
                  popover.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="ph">
                <img src="/images/peach-goat-salad.jpg" alt="Peach and goat cheese salad" />
              </div>
              <div className="body">
                <span className="kicker">Big Salads</span>
                <h3>Peach &amp; Goat Cheese</h3>
                <p>
                  Seasonal greens, fruit, and goat cheese — every salad comes
                  with a popover.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="ph">
                <img src="/images/popovers.jpg" alt="Warm popover with honey butter" />
              </div>
              <div className="body">
                <span className="kicker">Baked to Order</span>
                <h3>Warm Popovers</h3>
                <p>Pulled hot from the oven — one comes with every soup and salad.</p>
              </div>
            </div>
            <div className="card">
              <div className="ph">
                <img src="/images/cookies-bars.jpg" alt="Cookies and pecan bars" />
              </div>
              <div className="body">
                <span className="kicker">From the Bakery</span>
                <h3>Cookies &amp; Bars</h3>
                <p>
                  Fresh-baked cookies, brownies, and pecan bars to finish the
                  meal.
                </p>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Link className="btn btn-ghost" href="/order">
              See the Full Menu &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className="cater" id="catering">
        <div className="wrap">
          <div className="photo">
            <img src="/images/catering-platter.jpg" alt="Sliced pastrami catering platter" />
          </div>
          <div>
            <p className="eyebrow">Catering for 8 or more</p>
            <h2>Feeding the Whole Office?</h2>
            <p>
              The same corned beef, pastrami, and popovers — set up for the whole
              room. Just give us 24 hours&apos; notice and we&apos;ll handle the
              rest.
            </p>
            <ul>
              <li>Breakfast &amp; bagel trays</li>
              <li>Box lunches</li>
              <li>Hot lunches</li>
              <li>Deli &amp; bakery trays</li>
            </ul>
            <Link className="btn btn-primary" href="/catering">
              Plan a Catering Order
            </Link>
          </div>
        </div>
      </section>

      <section className="block visit" id="visit">
        <div className="wrap">
          <div className="visit-photo">
            <img
              src="/images/storefront.jpg"
              alt="The Brothers Deli storefront on the downtown Minneapolis skyway"
            />
          </div>
          <div>
            <p className="eyebrow">Visit the deli</p>
            <h2>Find Us on the Skyway</h2>
            <div className="addr">
              <span className="big">50 South Sixth Street</span>
              Skyway Level, Suite #220
              <br />
              Minneapolis, MN 55402
              <br />
              <a href="tel:16123418007">(612) 341-8007</a> ·{" "}
              <a href="mailto:thedeli@thebrothersdeli.com">
                thedeli@thebrothersdeli.com
              </a>
            </div>
            <span className="skyway">
              🚶 On the climate-controlled <b>skyway level</b>, Suite #220 — no
              weather, no traffic, straight from the office.
            </span>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/order">
                Order Now
              </Link>
              <a
                className="btn btn-ghost"
                href="https://maps.google.com/?q=50+South+6th+Street+Minneapolis+MN+55402"
                target="_blank"
                rel="noopener"
              >
                Get Directions
              </a>
            </div>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 10 }}>
              Hours
            </p>
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
            <div className="skyway" style={{ marginTop: 22 }}>
              Breakfast served from open until 10:30 AM. Lunch until close.
            </div>
          </div>
        </div>
      </section>

      <section className="order" id="order">
        <div className="wrap">
          <p className="eyebrow">Order ahead</p>
          <h2>Skip the Line. It&apos;s Ready When You Are.</h2>
          <p>
            Build your order online for pickup at the skyway counter, or call us
            and we&apos;ll have it waiting.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a className="btn btn-ghost" href="tel:16123418007">
              Call (612) 341-8007
            </a>
            <Link className="btn btn-light" href="/order">
              Order Now
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
