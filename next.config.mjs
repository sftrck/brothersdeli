const isProd = process.env.NODE_ENV === "production";

// Content Security Policy. Allows: our own origin, Google Fonts (stylesheet +
// font files), and the Google Maps embed on the Visit page. Inline styles/scripts
// are allowed because Next.js injects them; there is no user-generated HTML on
// the site, so the XSS surface is minimal. 'unsafe-eval' is dev-only (React
// Refresh / webpack need it) and is dropped in production.
// North Embedded Checkout loads checkout.js, mounts card fields in an iframe,
// and talks to North's API — all under *.north.com. Allowed for the script,
// the frame, and XHR/connections so the on-page card form works.
const NORTH = "https://checkout.north.com https://*.north.com";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} ${NORTH}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `img-src 'self' data: ${NORTH}`,
  `frame-src https://www.google.com https://maps.google.com ${NORTH}`,
  `connect-src 'self' ${NORTH}`,
  // North's fraud/fingerprint agent spins up a Web Worker from a blob: URL.
  `worker-src 'self' blob: ${NORTH}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
