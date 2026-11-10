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
              Turkey, roasted sirloin, pastrami and corned beef piled high,
              soups with a warm popover, and the same family recipes since 1935.
              Order ahead — it&apos;s ready when you are.
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
          <span>Pastrami</span>
          <span className="dot">·</span>
          <span>Corned Beef</span>
          <span className="dot">·</span>
          <span>Turkey</span>
          <span className="dot">·</span>
          <span>Roasted Sirloin</span>
          <span className="dot">·</span>
          <span>Catering</span>
        </div>
      </div>

      <section className="quote-band">
        <div className="wrap">
          <p>&ldquo;They come all the way from New York for our pastrami.&rdquo;</p>
          <span>— a longtime customer</span>
        </div>
      </section>

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
              <p className="eyebrow">Customer favorites</p>
              <h2>Our Top Ten</h2>
            </div>
            <p>
              The ten most-ordered picks from our 75 kinds of sandwiches, big
              salads and soups — all made to order.
            </p>
          </div>
          <ol className="top-ten">
            <li>
              <span className="tt-num">01</span>
              <div>
                <h3>Reuben</h3>
                <p>Corned beef, Swiss, sauerkraut and Russian dressing on grilled rye.</p>
              </div>
            </li>
            <li>
              <span className="tt-num">02</span>
              <div>
                <h3>The Pepe</h3>
                <p>Pastrami smoked then steamed three hours with melted pepper cheese.</p>
              </div>
            </li>
            <li>
              <span className="tt-num">03</span>
              <div>
                <h3>The Hots Pepe</h3>
                <p>Pastrami, pepper cheese, onion and hot sauce on grilled rye.</p>
              </div>
            </li>
            <li>
              <span className="tt-num">04</span>
              <div>
                <h3>Turkey Club</h3>
                <p>Grilled turkey, applewood bacon, tomatoes, Swiss and Russian dressing.</p>
              </div>
            </li>
            <li>
              <span className="tt-num">05</span>
              <div>
                <h3>Messy Bessy</h3>
                <p>Pastrami, corned beef, cole slaw, Swiss, tomatoes and thousand island.</p>
              </div>
            </li>
            <li>
              <span className="tt-num">06</span>
              <div>
                <h3>White Bean Chili</h3>
                <p>House white bean chicken chili by the bowl, with a warm popover.</p>
              </div>
            </li>
            <li>
              <span className="tt-num">07</span>
              <div>
                <h3>Strawberry Salad</h3>
                <p>Grilled chicken, strawberries, almonds and romaine in creamy poppyseed.</p>
              </div>
            </li>
            <li>
              <span className="tt-num">08</span>
              <div>
                <h3>Cobb Salad</h3>
                <p>Bacon, chicken, tomatoes, blue cheese, avocado and egg over greens.</p>
              </div>
            </li>
            <li>
              <span className="tt-num">09</span>
              <div>
                <h3>Garlic Steak</h3>
                <p>Steak, red onions, apple-smoked bacon and cheddar on garlic ciabatta.</p>
              </div>
            </li>
            <li>
              <span className="tt-num">10</span>
              <div>
                <h3>Pesto Chicken</h3>
                <p>Roasted chicken breast, tomatoes and pesto mayo on ciabatta.</p>
              </div>
            </li>
          </ol>
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
              The same turkey, roasted sirloin, pastrami and corned beef — set up
              for the whole room. Just give us 24 hours&apos; notice and
              we&apos;ll handle the rest.
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
              <a href="tel:16123148007">(612) 314-8007</a> ·{" "}
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
            <a className="btn btn-ghost" href="tel:16123148007">
              Call (612) 314-8007
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
