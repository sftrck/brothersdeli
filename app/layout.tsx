import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thebrothersdeli.com"),
  title: "The Brothers Deli | Corned Beef & Pastrami Since 1935 · Minneapolis",
  description:
    "A family-run Minneapolis deli since 1935. Corned beef, pastrami, matzo ball soup, and popovers on the downtown skyway. Order pickup, dine in, or cater your office.",
  openGraph: {
    title: "The Brothers Deli | Corned Beef & Pastrami Since 1935",
    description:
      "A family-run Minneapolis deli since 1935. Order pickup on the downtown skyway, or cater your office.",
    type: "website",
    images: ["/images/hero-pastrami.jpg"],
  },
  icons: { icon: "/images/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Yellowtail&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
