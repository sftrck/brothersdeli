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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "The Brothers Deli",
    description:
      "A family-run Minneapolis deli since 1935 — corned beef, pastrami, matzo ball soup, and popovers on the downtown skyway.",
    url: "https://www.thebrothersdeli.com",
    telephone: "+1-612-341-8007",
    email: "thedeli@thebrothersdeli.com",
    servesCuisine: ["Deli", "Jewish", "Sandwiches", "American"],
    priceRange: "$$",
    foundingDate: "1935",
    image: "https://www.thebrothersdeli.com/images/hero-pastrami.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "50 South Sixth Street, Skyway Level, Suite #220",
      addressLocality: "Minneapolis",
      addressRegion: "MN",
      postalCode: "55402",
      addressCountry: "US",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "07:30",
        closes: "13:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "10:30",
        closes: "13:00",
      },
    ],
    acceptsReservations: "False",
  };

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Yellowtail&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
