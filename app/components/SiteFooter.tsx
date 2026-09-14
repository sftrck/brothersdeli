import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="the">The</div>
            <div className="name">Brothers Deli</div>
            <p className="tag">
              A Minneapolis family deli since 1935. Corned beef, pastrami, and
              popovers in the downtown skyway.
            </p>
          </div>
          <div className="foot-col">
            <h4>Explore</h4>
            <Link href="/order">Menu &amp; Ordering</Link>
            <Link href="/catering">Catering</Link>
            <Link href="/#story">Our Story</Link>
            <Link href="/#visit">Visit &amp; Hours</Link>
          </div>
          <div className="foot-col">
            <h4>Visit</h4>
            <p>
              50 South Sixth Street
              <br />
              Skyway Level, Suite #220
              <br />
              Minneapolis, MN 55402
            </p>
            <a href="tel:16123418007">(612) 341-8007</a>
            <a href="mailto:thedeli@thebrothersdeli.com">
              thedeli@thebrothersdeli.com
            </a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 1935–2026 The Brothers Deli · Downtown Minneapolis Skyway</span>
          <span>Mon–Thu 7:30–1:30 · Fri 10:30–1:00</span>
        </div>
      </div>
    </footer>
  );
}
