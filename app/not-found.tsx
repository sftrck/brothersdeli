import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <div className="confirm" style={{ marginTop: 72 }}>
        <h2>Page Not Found</h2>
        <p>
          That page isn&apos;t on the menu. Let&apos;s get you back to the good
          stuff.
        </p>
        <p
          style={{
            marginTop: 20,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link className="btn btn-primary" href="/order">
            Order Now
          </Link>
          <Link className="btn btn-ghost" href="/">
            Back to Home
          </Link>
        </p>
      </div>
      <SiteFooter />
    </>
  );
}
