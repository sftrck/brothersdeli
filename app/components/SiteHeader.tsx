"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          Downtown Minneapolis Skyway &nbsp;·&nbsp;{" "}
          <b>Open Mon–Fri for breakfast &amp; lunch</b> &nbsp;·&nbsp; (612)
          314-8007
        </div>
      </div>

      <header>
        <div className="wrap bar">
          <Link className="brand" href="/" onClick={close}>
            <span className="the">The</span>
            <span className="name">Brothers Deli</span>
            <span className="est">EST. 1935 · MINNEAPOLIS</span>
          </Link>
          <nav className="main">
            <Link href="/order">Menu</Link>
            <Link href="/catering">Catering</Link>
            <Link href="/our-story">Our Story</Link>
            <Link href="/visit">Visit</Link>
          </nav>
          <div className="header-cta">
            <a className="phone" href="tel:16123148007">
              (612) 314-8007<span>Call the deli</span>
            </a>
            <Link className="btn btn-primary" href="/order">
              Order Now
            </Link>
            <button
              type="button"
              className="nav-toggle"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <span className={`burger${open ? " open" : ""}`}>
                <i />
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>

        {open && (
          <nav className="mobile-nav" onClick={close}>
            <Link href="/order">Menu</Link>
            <Link href="/catering">Catering</Link>
            <Link href="/our-story">Our Story</Link>
            <Link href="/visit">Visit</Link>
            <a href="tel:16123148007">Call (612) 314-8007</a>
          </nav>
        )}
      </header>
    </>
  );
}
