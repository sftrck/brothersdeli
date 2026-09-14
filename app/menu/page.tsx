import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { MENU } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Menu | The Brothers Deli · Minneapolis",
  description:
    "The full Brothers Deli menu — corned beef, pastrami, nine kinds of sandwich, big salads, soups with a popover, the Fit 500 line, breakfast, and bakery. Downtown Minneapolis skyway.",
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function MenuPage() {
  return (
    <>
      <SiteHeader />

      <div className="page-intro">
        <div className="wrap">
          <p className="eyebrow">The full menu</p>
          <h1>Everything on the Board</h1>
          <p>
            Made to order since 1935. Sandwiches come with chips and a pickle;
            every soup and salad comes with a warm popover. When you&apos;re
            ready, build your order for pickup at the skyway counter.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" href="/order">
              Order Now
            </Link>
            <a className="btn btn-ghost" href="tel:16123418007">
              Call (612) 341-8007
            </a>
          </div>
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

      <div className="wrap" style={{ paddingBlock: 32, maxWidth: 900 }}>
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
                    {item.variants ? (
                      <span className="price">
                        {item.variants
                          .map((v) => `${v.label.split(" ")[0]} ${money(v.price)}`)
                          .join(" · ")}
                      </span>
                    ) : (
                      <span className="price">{money(item.price ?? 0)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link className="btn btn-primary" href="/order">
            Order Now &rarr;
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
