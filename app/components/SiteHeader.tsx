import Link from "next/link";

export default function SiteHeader() {
  return (
    <>
      <div className="topbar">
        <div className="wrap">
          Downtown Minneapolis Skyway &nbsp;·&nbsp;{" "}
          <b>Open Mon–Fri for breakfast &amp; lunch</b> &nbsp;·&nbsp; (612)
          341-8007
        </div>
      </div>

      <header>
        <div className="wrap bar">
          <Link className="brand" href="/">
            <span className="the">The</span>
            <span className="name">Brothers Deli</span>
            <span className="est">EST. 1935 · MINNEAPOLIS</span>
          </Link>
          <nav className="main">
            <Link href="/order">Menu</Link>
            <Link href="/catering">Catering</Link>
            <Link href="/#story">Our Story</Link>
            <Link href="/#visit">Visit</Link>
          </nav>
          <div className="header-cta">
            <a className="phone" href="tel:16123418007">
              (612) 341-8007<span>Call the deli</span>
            </a>
            <Link className="btn btn-primary" href="/order">
              Order Pickup
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
