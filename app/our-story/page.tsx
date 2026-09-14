import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Our Story | The Brothers Deli · Family-Run Since 1935",
  description:
    "From Mike's Cafe in 1935 to the downtown Minneapolis skyway — three generations of the Burstein family behind The Brothers Deli.",
};

export default function OurStoryPage() {
  return (
    <>
      <SiteHeader />

      <div className="page-intro">
        <div className="wrap">
          <p className="eyebrow">Our Story</p>
          <h1>Three Generations, One Counter</h1>
          <p>
            Ninety years of honest food, made by hand. Here&apos;s how a small
            Minneapolis cafe became the deli you know today.
          </p>
        </div>
      </div>

      <section className="story-narrative">
        <div className="wrap">
          <div>
            <h2>Made by Hand Since 1935</h2>
            <p>
              It started in 1935 when Mike and Dora Burstein opened Mike&apos;s
              Cafe — honest food, made by hand, for working people. In 1959 their
              sons Leonard and Sam moved the cafe to 19 South 7th Street and
              renamed it The Brothers Deli.
            </p>
            <p>
              Leonard and Sam grew the Brothers into a successful chain — at one
              point 16 restaurants across Minnesota and North Dakota. Declining
              health finally led them to sell in 1983.
            </p>
            <p>
              In 1993, Leonard&apos;s son Jeff Burstein reopened The Brothers
              Deli in downtown Minneapolis. We moved to our present home at 50
              South Sixth Street in November 2000, and it&apos;s been our
              privilege to serve you on the skyway ever since — still curing the
              corned beef, simmering the soup, and pulling popovers hot from the
              oven.
            </p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/order">
                Order Pickup
              </Link>
              <Link className="btn btn-ghost" href="/visit">
                Visit the Deli
              </Link>
            </div>
          </div>
          <div className="portrait">
            <img
              src="/images/storefront.jpg"
              alt="The Brothers Deli storefront on the downtown Minneapolis skyway"
            />
          </div>
        </div>
      </section>

      <section className="timeline">
        <div className="wrap">
          <div className="head-c">
            <p className="eyebrow">The timeline</p>
            <h2>Nine Decades on the Menu</h2>
          </div>
          <div className="tl-grid">
            <div className="tl">
              <div className="yr">1935</div>
              <h3>Mike&apos;s Cafe Opens</h3>
              <p>Mike &amp; Dora Burstein start a small Minneapolis cafe.</p>
            </div>
            <div className="tl">
              <div className="yr">1959</div>
              <h3>The Brothers Deli</h3>
              <p>Sons Leonard &amp; Sam move to 19 South 7th and rename it — soon a 16-restaurant chain.</p>
            </div>
            <div className="tl">
              <div className="yr">1993</div>
              <h3>Reopened Downtown</h3>
              <p>Leonard&apos;s son Jeff Burstein brings the Brothers back to downtown Minneapolis.</p>
            </div>
            <div className="tl">
              <div className="yr">2000</div>
              <h3>Home on the Skyway</h3>
              <p>The deli settles into 50 South Sixth Street, Suite #220 — where it still is today.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="review-band">
        <div className="wrap">
          <p className="quote">
            &ldquo;One of the few places which has stood the test of time. I come
            for the popovers — big, fluffy, baked to perfection — and stay for a
            half reuben. A welcoming atmosphere with employees who make people
            feel valued.&rdquo;
          </p>
          <div className="cite">— Erica B. · Yelp</div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="story-photos">
            <div className="ph">
              <img src="/images/corned-beef.jpg" alt="Corned beef sandwich" />
            </div>
            <div className="ph">
              <img src="/images/matzo-ball-soup.jpg" alt="Matzo ball soup" />
            </div>
            <div className="ph">
              <img src="/images/popovers.jpg" alt="Warm popovers" />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
